import http from 'node:http';
import { URL } from 'node:url';
import { DashScopeRealtimePool } from './dashscope_realtime_pool.js';
import { pcm16ToWav } from './wav.js';

const PORT = Number.parseInt(process.env.PORT ?? '3901', 10);
const HOST = process.env.HOST ?? '127.0.0.1';

const BRIDGE_TOKEN = process.env.BRIDGE_TOKEN ?? ''; // optional

const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY ?? '';
const DASHSCOPE_MODEL = process.env.DASHSCOPE_MODEL ?? 'qwen3-tts-flash-realtime';
const DASHSCOPE_VOICE = process.env.DASHSCOPE_VOICE ?? 'Cherry';
const DASHSCOPE_LANGUAGE_TYPE = process.env.DASHSCOPE_LANGUAGE_TYPE ?? 'Auto';
const SAMPLE_RATE = Number.parseInt(process.env.SAMPLE_RATE ?? '24000', 10);
const POOL_SIZE = Number.parseInt(process.env.POOL_SIZE ?? '1', 10);

if (!DASHSCOPE_API_KEY) {
  console.warn('[tts-bridge] DASHSCOPE_API_KEY is not set. Requests will fail until configured.');
}

const pool = new DashScopeRealtimePool({
  apiKey: DASHSCOPE_API_KEY,
  model: DASHSCOPE_MODEL,
  voice: DASHSCOPE_VOICE,
  languageType: DASHSCOPE_LANGUAGE_TYPE,
  sampleRate: SAMPLE_RATE,
  poolSize: POOL_SIZE,
  region: 'beijing'
});

await pool.start();

function json(res, code, obj) {
  const body = Buffer.from(JSON.stringify(obj));
  res.statusCode = code;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('content-length', body.length);
  res.end(body);
}

function unauthorized(res) {
  res.statusCode = 401;
  res.setHeader('www-authenticate', 'Bearer');
  res.end('Unauthorized');
}

function readBody(req, limitBytes = 1_000_000) {
  return new Promise((resolve, reject) => {
    let total = 0;
    const chunks = [];
    req.on('data', (c) => {
      total += c.length;
      if (total > limitBytes) {
        reject(Object.assign(new Error('Body too large'), { code: 'BODY_TOO_LARGE' }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function checkAuth(req) {
  if (!BRIDGE_TOKEN) return true; // open by default on localhost
  const h = req.headers['authorization'] || '';
  const m = /^Bearer\s+(.+)$/i.exec(Array.isArray(h) ? h[0] : h);
  if (!m) return false;
  return m[1] === BRIDGE_TOKEN;
}

const server = http.createServer(async (req, res) => {
  const startedAt = Date.now();
  try {
    const u = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

    // health
    if (req.method === 'GET' && (u.pathname === '/healthz' || u.pathname === '/')) {
      return json(res, 200, {
        ok: true,
        name: 'openclaw-tts-bridge',
        dashscope: {
          model: DASHSCOPE_MODEL,
          voice: DASHSCOPE_VOICE,
          sampleRate: SAMPLE_RATE,
          poolSize: POOL_SIZE,
          ready: pool.readyState()
        }
      });
    }

    // OpenAI-compatible: POST /audio/speech (OpenClaw uses `${baseUrl}/audio/speech`)
    // Also accept /v1/audio/speech.
    const isSpeech = (u.pathname === '/audio/speech' || u.pathname === '/v1/audio/speech');
    if (req.method === 'POST' && isSpeech) {
      if (!checkAuth(req)) return unauthorized(res);

      const raw = await readBody(req);
      let payload;
      try {
        payload = JSON.parse(raw.toString('utf8'));
      } catch {
        return json(res, 400, { error: { message: 'Invalid JSON' } });
      }

      const text = (payload?.input ?? payload?.text ?? '').toString();
      if (!text || !text.trim()) {
        return json(res, 400, { error: { message: 'Missing input text (input)' } });
      }

      const reqId = `req_${Date.now()}_${Math.random().toString(16).slice(2)}`;

      const t0 = Date.now();
      const result = await pool.synthesize({ text, requestId: reqId });
      const t1 = Date.now();

      // v1: wrap PCM16LE -> WAV and return.
      const wav = pcm16ToWav(result.pcm, {
        sampleRate: SAMPLE_RATE,
        channels: 1,
        bitDepth: 16
      });

      res.statusCode = 200;
      res.setHeader('content-type', 'audio/wav');
      res.setHeader('x-tts-bridge-request-id', reqId);
      res.setHeader('x-tts-bridge-t-acquire-ms', String(result.timings.acquireConnMs));
      res.setHeader('x-tts-bridge-t-first-audio-ms', String(result.timings.firstAudioDeltaMs));
      res.setHeader('x-tts-bridge-t-upstream-ms', String(result.timings.upstreamTotalMs));
      res.setHeader('x-tts-bridge-t-total-ms', String(t1 - t0));
      res.setHeader('content-length', wav.length);
      res.end(wav);

      console.log(JSON.stringify({
        at: new Date().toISOString(),
        reqId,
        path: u.pathname,
        bytesPcm: result.pcm.length,
        bytesWav: wav.length,
        timings: result.timings,
        totalMs: Date.now() - startedAt
      }));
      return;
    }

    res.statusCode = 404;
    res.end('Not Found');
  } catch (err) {
    res.statusCode = 500;
    res.setHeader('content-type', 'text/plain; charset=utf-8');
    res.end(`Internal error: ${err?.message ?? String(err)}`);
    console.error('[tts-bridge] error', err);
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[tts-bridge] listening on http://${HOST}:${PORT}`);
  console.log(`[tts-bridge] model=${DASHSCOPE_MODEL} voice=${DASHSCOPE_VOICE} sampleRate=${SAMPLE_RATE} poolSize=${POOL_SIZE}`);
});

process.on('SIGINT', async () => {
  console.log('[tts-bridge] SIGINT: shutting down...');
  server.close();
  await pool.stop();
  process.exit(0);
});
