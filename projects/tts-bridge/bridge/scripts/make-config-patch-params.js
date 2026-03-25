import fs from 'node:fs';

const cfgPath = process.argv[2] || '/tmp/cfg4.json';
const outPath = process.argv[3] || '/tmp/config_patch_params.json';

const j = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
const baseHash = j.hash;

const patch = {
  messages: {
    tts: {
      provider: 'openai',
      openai: {
        baseUrl: 'http://172.18.0.3:3901/v1',
        model: 'gpt-4o-mini-tts',
        voice: 'alloy'
      }
    }
  }
};

const params = {
  baseHash,
  raw: JSON.stringify(patch, null, 2),
  note: 'patch tts.openai baseUrl to local bridge'
};

fs.writeFileSync(outPath, JSON.stringify(params), 'utf8');
console.log('wrote', outPath, 'bytes', Buffer.byteLength(JSON.stringify(params)));
