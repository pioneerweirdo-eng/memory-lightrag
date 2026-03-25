import { WebSocket } from 'ws';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Single DashScope realtime connection.
 * v1: serialized requests per connection to avoid protocol/state ambiguity.
 */
class DashScopeRealtimeConn {
  constructor({ apiKey, model, voice, languageType, sampleRate, urlBase, id }) {
    this.apiKey = apiKey;
    this.model = model;
    this.voice = voice;
    this.languageType = languageType;
    this.sampleRate = sampleRate;
    this.urlBase = urlBase;
    this.id = id;

    this.ws = null;
    this.ready = false;
    this.inflight = null;
    this.lastError = null;
  }

  url() {
    return `${this.urlBase}?model=${encodeURIComponent(this.model)}`;
  }

  async connect() {
    if (!this.apiKey) throw new Error('DashScope apiKey missing');
    const headers = {
      Authorization: `Bearer ${this.apiKey}`
    };

    this.ws = new WebSocket(this.url(), { headers });

    await new Promise((resolve, reject) => {
      const onOpen = () => resolve();
      const onErr = (e) => reject(e);
      this.ws.once('open', onOpen);
      this.ws.once('error', onErr);
    });

    this.ws.on('message', (data) => {
      try {
        const evt = JSON.parse(data.toString('utf8'));
        this._onEvent(evt);
      } catch (e) {
        // ignore unparsable
        this.lastError = e;
      }
    });

    this.ws.on('close', () => {
      this.ready = false;
      // fail inflight
      if (this.inflight?.reject) {
        this.inflight.reject(new Error('DashScope websocket closed'));
        this.inflight = null;
      }
    });

    await this._sessionUpdate();
    this.ready = true;
  }

  async _send(event) {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) throw new Error('WebSocket not open');
    const payload = JSON.stringify({
      event_id: `evt_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      ...event
    });
    this.ws.send(payload);
  }

  async _sessionUpdate() {
    await this._send({
      type: 'session.update',
      session: {
        mode: 'server_commit',
        voice: this.voice,
        language_type: this.languageType,
        response_format: 'pcm',
        sample_rate: this.sampleRate
      }
    });
  }

  async synthesize({ text, requestId }) {
    if (!this.ready) {
      await this.connect();
    }
    if (this.inflight) {
      throw new Error('Connection busy');
    }

    const timings = {
      acquireConnMs: 0,
      firstAudioDeltaMs: -1,
      upstreamTotalMs: -1
    };

    const startedAt = Date.now();

    // In server_commit mode, clear is not supported; each commit is treated as a new item.
    await this._send({ type: 'input_text_buffer.append', text });
    await this._send({ type: 'input_text_buffer.commit' });

    const pcmChunks = [];

    const p = new Promise((resolve, reject) => {
      this.inflight = {
        requestId,
        startedAt,
        timings,
        pcmChunks,
        resolve,
        reject
      };

      // hard timeout (v1 default 3s)
      this.inflight.timer = setTimeout(() => {
        reject(new Error('DashScope TTS timeout'));
        this.inflight = null;
      }, 3000);
    });

    return await p;
  }

  _onEvent(evt) {
    if (!evt || typeof evt !== 'object') return;

    if (evt.type === 'error') {
      const msg = evt.error?.message ?? JSON.stringify(evt.error ?? evt);
      if (this.inflight?.reject) {
        clearTimeout(this.inflight.timer);
        this.inflight.reject(new Error(`DashScope error: ${msg}`));
        this.inflight = null;
      }
      return;
    }

    // Only care about audio stream for inflight request.
    if (!this.inflight) return;

    if (evt.type === 'response.audio.delta') {
      if (this.inflight.timings.firstAudioDeltaMs < 0) {
        this.inflight.timings.firstAudioDeltaMs = Date.now() - this.inflight.startedAt;
      }
      const b64 = evt.delta ?? '';
      if (b64) {
        const buf = Buffer.from(b64, 'base64');
        this.inflight.pcmChunks.push(buf);
      }
      return;
    }

    if (evt.type === 'response.done') {
      clearTimeout(this.inflight.timer);
      this.inflight.timings.upstreamTotalMs = Date.now() - this.inflight.startedAt;
      const pcm = Buffer.concat(this.inflight.pcmChunks);
      const out = { pcm, timings: this.inflight.timings };
      this.inflight.resolve(out);
      this.inflight = null;
      return;
    }

    // ignore other events
  }

  async close() {
    if (!this.ws) return;
    try {
      this.ws.close();
    } catch {}
    this.ws = null;
    this.ready = false;
  }
}

export class DashScopeRealtimePool {
  constructor({ apiKey, model, voice, languageType, sampleRate, poolSize, region }) {
    this.apiKey = apiKey;
    this.model = model;
    this.voice = voice;
    this.languageType = languageType;
    this.sampleRate = sampleRate;
    this.poolSize = Math.max(1, poolSize);
    this.region = region;

    this.urlBase = region === 'singapore'
      ? 'wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime'
      : 'wss://dashscope.aliyuncs.com/api-ws/v1/realtime';

    this.conns = [];
    this.queue = [];
    this.started = false;
  }

  readyState() {
    return {
      started: this.started,
      poolSize: this.poolSize,
      conns: this.conns.map((c) => ({ id: c.id, ready: c.ready, inflight: !!c.inflight }))
    };
  }

  async start() {
    if (this.started) return;
    this.started = true;

    for (let i = 0; i < this.poolSize; i++) {
      const c = new DashScopeRealtimeConn({
        apiKey: this.apiKey,
        model: this.model,
        voice: this.voice,
        languageType: this.languageType,
        sampleRate: this.sampleRate,
        urlBase: this.urlBase,
        id: `conn_${i}`
      });
      this.conns.push(c);
    }

    // Warm-up connect in background (do not block start if key missing)
    for (const c of this.conns) {
      c.connect().catch((e) => {
        c.lastError = e;
      });
    }
  }

  async stop() {
    for (const c of this.conns) {
      await c.close();
    }
    this.started = false;
  }

  async _acquire() {
    // naive: first free conn; else wait
    const t0 = Date.now();
    while (true) {
      for (const c of this.conns) {
        if (!c.inflight) {
          return { conn: c, waitedMs: Date.now() - t0 };
        }
      }
      await sleep(5);
    }
  }

  async synthesize({ text, requestId }) {
    const { conn, waitedMs } = await this._acquire();
    const result = await conn.synthesize({ text, requestId });
    result.timings.acquireConnMs = waitedMs;
    return result;
  }
}
