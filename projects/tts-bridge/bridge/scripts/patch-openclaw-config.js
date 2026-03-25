const fs = require('fs');
const input = process.argv[2] || '/tmp/raw.js';
const output = process.argv[3] || '/tmp/raw_patched.js';
let raw = fs.readFileSync(input, 'utf8');

function patchOne(re, replacement, label){
  const before = raw;
  raw = raw.replace(re, replacement);
  if (raw === before) {
    console.error('patch failed:', label);
    process.exit(1);
  }
}

patchOne(
  /(messages\s*:\s*\{[\s\S]*?tts\s*:\s*\{[\s\S]*?openai\s*:\s*\{[\s\S]*?baseUrl:\s*')[^']*('\s*,)/m,
  `$1http://172.18.0.3:3901/v1$2`,
  'messages.tts.openai.baseUrl'
);

patchOne(
  /(messages\s*:\s*\{[\s\S]*?tts\s*:\s*\{[\s\S]*?openai\s*:\s*\{[\s\S]*?model:\s*')[^']*('\s*,)/m,
  `$1qwen3-tts-flash-realtime$2`,
  'messages.tts.openai.model'
);

fs.writeFileSync(output, raw, 'utf8');
console.log('wrote', output, 'len', raw.length);
