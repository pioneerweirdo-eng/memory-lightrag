# OpenClaw TTS Bridge (v1)

This is a local sidecar service that presents an **OpenAI-compatible TTS** endpoint for OpenClaw, while internally calling DashScope (Alibaba Bailian) **Qwen3 TTS Realtime** over WebSocket.

## Why
- OpenClaw built-in TTS providers: `openai`, `elevenlabs`, `microsoft`.
- DashScope Qwen3 TTS Realtime is **not** OpenAI-compatible (WS protocol).
- A bridge lets OpenClaw keep using `provider=openai`, while we adapt upstream providers and run A/B tests.

## v1 scope
- Latency-first.
- Output: `audio/wav` (PCM16LE 24kHz mono) to avoid ffmpeg/codec overhead.
- WS connection pool to avoid cold-start handshake p95.

## Run
```bash
cd projects/tts-bridge/bridge
npm i

export DASHSCOPE_API_KEY=...          # required
export BRIDGE_TOKEN=...               # optional (recommended)
export PORT=3901

npm run start
```

## OpenClaw config
Point OpenClaw OpenAI TTS to the bridge.

Recommended baseUrl (uses /v1/audio/speech):
```bash
openclaw config set messages.tts.provider openai
openclaw config set messages.tts.openai.baseUrl "http://127.0.0.1:3901/v1"
openclaw config set messages.tts.openai.apiKey "${BRIDGE_TOKEN}"
openclaw config set messages.tts.openai.model "qwen3-tts-flash-realtime"
```

## Health
- `GET /healthz`

## Notes
- `voice` defaults to `Cherry`.
- `sample_rate` fixed to 24000 in v1.
