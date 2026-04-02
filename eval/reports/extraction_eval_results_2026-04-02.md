# Extraction Evaluation Report — 2026-04-02T03:13:44.993Z

## Configuration

| Parameter | Value |
|---|---|
| Model | gemini-3.1-flash-lite-preview |
| Extraction Provider | openai |
| Extraction Base URL | http://127.0.0.1:3000/v1 |
| Dataset | extraction_labeled_v1.json |
| Samples | 31 |
| Skipped (error) | 0 |

## Aggregate Metrics

| Metric | Value | Threshold | Pass? |
|---|---|---|---|
| schema validity rate | 100.00% | 95.00% | ✓ PASS |
| provenance completeness | 100.00% | 98.00% | ✓ PASS |
| type accuracy | 90.32% | 85.00% | ✓ PASS |
| unsupported-claim rate | 3.23% | 5.00% | ✓ PASS |
| fallback-to-raw rate | 0.00% | (reported) | — |

## Per-Kind Breakdown

| Kind | Total | Schema Valid | Type Accurate |
|---|---|---|---|
| episode | 16 | 100.00% | 93.75% |
| decision | 9 | 100.00% | 88.89% |
| preference | 6 | 100.00% | 83.33% |

## Per-Sample Results

| Sample | Expected Kind | Schema | Prov | Type | Fallback | Unsupported | Notes |
|---|---|---|---|---|---|---|---|
| EX-EP001 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP002 | episode | ✓ | ✓ | ✗ | — | — |  |
| EX-EP003 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP004 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP005 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP006 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP007 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP008 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP009 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP010 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP011 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-EP012 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-DC001 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC002 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC003 | decision | ✓ | ✓ | ✗ | — | — |  |
| EX-DC004 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC005 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC006 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC007 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC008 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-DC009 | decision | ✓ | ✓ | ✓ | — | — |  |
| EX-PF001 | preference | ✓ | ✓ | ✓ | — | — |  |
| EX-PF002 | preference | ✓ | ✓ | ✓ | — | — |  |
| EX-PF003 | preference | ✓ | ✓ | ✗ | — | ⚠ |  |
| EX-PF004 | preference | ✓ | ✓ | ✓ | — | — |  |
| EX-PF005 | preference | ✓ | ✓ | ✓ | — | — |  |
| EX-PF006 | preference | ✓ | ✓ | ✓ | — | — |  |
| EX-AMB001 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-AMB002 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-FALLBACK001 | episode | ✓ | ✓ | ✓ | — | — |  |
| EX-FALLBACK002 | episode | ✓ | ✓ | ✓ | — | — |  |

## Gate Decision

**✓ ALL GATES PASSED** — P1 production rollout is unblocked.

---
*Extraction eval runner v2026-04-02 · dataset extraction_labeled_v1.json*