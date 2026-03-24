
## [ERR-20260324-002] tts.convert (ElevenLabs 402, OpenAI 401, Microsoft not configured)

**Logged**: 2026-03-24T23:24:40Z
**Priority**: critical
**Status**: pending
**Area**: infra

### Summary
TTS conversion fails across providers: ElevenLabs returns HTTP 402, OpenAI returns HTTP 401, and Microsoft provider reports not configured.

### Error
```
TTS conversion failed: elevenlabs: ElevenLabs API error (402); openai: OpenAI TTS API error (401); microsoft: not configured
```

### Context
- Config shows `messages.tts.auto=always`, provider initially `elevenlabs`, later set to `microsoft`.
- `tts.providers` reports:
  - openai configured: true
  - elevenlabs configured: true
  - microsoft configured: false
- Attempted RPC:
  - `openclaw gateway call tts.convert --params '{"text":"测试一下语音。海今，我现在检查 TTS 是否正常。","voiceHint":"zh-CN"}'`
  - still fails with the same multi-provider error.
- `messages.tts.microsoft.enabled` was set true, but `tts.status` still shows `microsoftEnabled=false`.

### Suspected causes
- OpenAI TTS auth mismatch (401): key/baseUrl for TTS not correctly wired (e.g., gateway not loading `OPENAI_API_KEY` for TTS, or wrong baseUrl, or expects OPENAI_TTS_BASE_URL).
- ElevenLabs billing/quota issue (402): API key valid but account has no remaining credits or requires payment.
- Microsoft provider not available in this runtime: `node-edge-tts` exists in /app dependencies, but gateway reports not configured; possibly disabled at build/runtime, missing binary deps, or config hot reload not applied.

### Suggested Fix
- Confirm gateway env loading includes OPENAI_API_KEY and ELEVENLABS_API_KEY for the running gateway process.
- Try forcing OpenAI TTS baseUrl/model/voice under `messages.tts.openai` and verify with `tts.convert`.
- If using OpenAI-compatible proxy (SiliconFlow), verify it supports TTS endpoints; otherwise use real OpenAI baseUrl for TTS.
- Investigate why Microsoft provider is `configured:false` despite config enabling it (plugin/runtime packaging or reload issue).

### Metadata
- Reproducible: yes
- Related Files: /home/node/.openclaw/openclaw.json
- Tags: tts, elevenlabs, openai, microsoft, auth, billing

---
