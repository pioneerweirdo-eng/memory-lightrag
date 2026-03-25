# OpenClaw TTS Bridge (v2)

This is a local sidecar service that presents an **OpenAI-compatible TTS** endpoint for OpenClaw, while internally calling DashScope (Alibaba Bailian) **Qwen3 TTS Realtime** over WebSocket.

## Why
- OpenClaw built-in TTS providers: `openai`, `elevenlabs`, `microsoft`.
- DashScope Qwen3 TTS Realtime is **not** OpenAI-compatible (WS protocol).
- A bridge lets OpenClaw keep using `provider=openai`, while we adapt upstream providers and run A/B tests.

## v2 scope
- Telegram voice-note bubble ready: `response_format=opus` returns **Ogg/Opus**.
- `response_format=mp3` returns MP3.
- `response_format=wav` returns WAV (debug).
- WS connection hygiene: on timeout / upstream error, the websocket is closed and will reconnect on next request.

## Run
```bash
cd projects/tts-bridge/bridge
npm i

# Install a bridge-local static ffmpeg binary (recommended)
./scripts/install-ffmpeg.sh

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
openclaw config set messages.tts.openai.voice "alloy"   # OpenClaw requires a valid voice id; bridge ignores it.
```

## Health
- `GET /healthz` returns dashscope pool state + ffmpeg probe info.

## Notes
- DashScope voice defaults to `Cherry` (env: `DASHSCOPE_VOICE`).
- `DASHSCOPE_TTS_TIMEOUT_MS` controls upstream timeout (default: 6000).
- The bridge returns `audio/ogg` for opus requests (Telegram bubble), and `audio/mpeg` for mp3.
