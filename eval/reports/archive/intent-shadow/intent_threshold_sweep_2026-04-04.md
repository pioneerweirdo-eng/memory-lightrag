# Intent Threshold Sweep — 2026-04-04

## Configuration

- Provider type: `http_classifier`
- Provider baseUrl: `http://127.0.0.1:7771`
- Shadow mode: `false`
- Thresholds: `0.55, 0.6, 0.7, 0.8, 0.9`

## Sweep Results

| Threshold | Selected Accuracy | Selected From Model | Fallback Count | WHY Recall | WHEN Recall | ENTITY Recall | GENERAL Recall |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 0.55 | 96.88% | 155 | 5 | 100.00% | 90.63% | 100.00% | 97.30% |
| 0.60 | 96.88% | 153 | 7 | 100.00% | 90.63% | 100.00% | 97.30% |
| 0.70 | 96.88% | 153 | 7 | 100.00% | 90.63% | 100.00% | 97.30% |
| 0.80 | 96.88% | 151 | 9 | 100.00% | 90.63% | 100.00% | 97.30% |
| 0.90 | 96.88% | 151 | 9 | 100.00% | 90.63% | 100.00% | 97.30% |

## Recommendation

- Recommended threshold: `0.55`
- Why: highest selected accuracy `96.88%` with the lowest fallback count `5` among tied candidates.
- Resulting recall profile: WHY `100.00%`, WHEN `90.63%`, ENTITY `100.00%`, GENERAL `97.30%`.

## Reading Rule

- This sweep is a replay-gating result, not a claim that runtime online handover is fully proven.
- Deterministic fallback remains mandatory.
- The next safe step is limited non-shadow adoption with telemetry, not removing the deterministic path.
