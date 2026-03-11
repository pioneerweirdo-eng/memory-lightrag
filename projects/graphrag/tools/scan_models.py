import json, time, urllib.request, urllib.error, sys

KEY = sys.argv[1]
BASE = sys.argv[2].rstrip('/')

models_json_path = sys.argv[3]

j = json.load(open(models_json_path, 'r', encoding='utf-8'))
models = [m.get('id') for m in j.get('data', []) if m.get('id')]
print('Total models:', len(models))

results = []

def test(model: str):
    payload = {
        'model': model,
        'messages': [{'role': 'user', 'content': 'Reply with exactly: OK'}],
        'max_tokens': 8,
        'temperature': 0,
    }
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(BASE + '/chat/completions', data=data, method='POST')
    req.add_header('Content-Type', 'application/json')
    req.add_header('Authorization', f'Bearer {KEY}')
    t0 = time.time()
    try:
        with urllib.request.urlopen(req, timeout=25) as resp:
            body = resp.read().decode('utf-8', 'replace')
            dt = int((time.time() - t0) * 1000)
            return ('ok', resp.status, dt, body[:160])
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8', 'replace')
        dt = int((time.time() - t0) * 1000)
        return ('err', e.code, dt, body[:260])
    except Exception as e:
        dt = int((time.time() - t0) * 1000)
        return ('err', 'ERR', dt, str(e)[:260])

for m in models:
    kind, code, dt, info = test(m)
    results.append({'model': m, 'kind': kind, 'code': code, 'ms': dt, 'info': info.replace('\n', ' ')})
    time.sleep(0.3)

out = {'base': BASE, 'count': len(results), 'results': results}
print('OK models:', sum(1 for r in results if r['kind'] == 'ok'))

with open('/tmp/scan_results.json', 'w', encoding='utf-8') as f:
    json.dump(out, f, ensure_ascii=False, indent=2)

# Compact print
from collections import Counter
codes = Counter(str(r['code']) for r in results if r['kind'] != 'ok')
print('Errors by code:', dict(codes))
