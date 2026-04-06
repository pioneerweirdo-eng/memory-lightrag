# Answer Calibration Audit - 2026-04-06

Offline shadow audit for current confidence signals (`top group score` and `top answer confidence score`) against correctness and answerability labels.

## Configuration

- Intent eval mode: deterministic_only
- Scenario banks: positive_reference (10), negative_unanswerable (3)
- Total cases: 13

## Overall Summary

- Correctness rate: 61.54%
- Expected answerable rate: 76.92%
- Predicted answerable rate (current answer behavior): 92.31%
- Answerability agreement: 84.62%

## Bank Breakdown

| Bank | Count | Correctness | Expected Answerable | Predicted Answerable | Avg Group Score | Avg Answer Score |
|---|---:|---:|---:|---:|---:|---:|
| positive_reference | 10 | 70.00% | 100.00% | 100.00% | 0.5120 | 0.4322 |
| negative_unanswerable | 3 | 33.33% | 0.00% | 66.67% | 0.3147 | 0.2775 |

## Top Group Score vs Correctness

- Sample count: 13
- Mean confidence: 0.4665
- Mean label rate: 0.6154
- ECE (10 bins): 0.1979
- Brier: 0.2786

### Best Threshold (F1 Sweep)

- threshold=0.45 precision=0.7000 recall=0.8750 f1=0.7778 accuracy=0.6923

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.5445 | 1.0000 | 0.0000 |
| 50.00% | 7 | 0.4972 | 0.8571 | 0.1429 |
| 75.00% | 10 | 0.4622 | 0.7000 | 0.3000 |
| 100.00% | 13 | 0.0000 | 0.6154 | 0.3846 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 1.0000 | 1.0000 |
| [0.4, 0.5) | 7 | 0.4741 | 0.4286 | 0.0455 |
| [0.5, 0.6) | 5 | 0.5492 | 0.8000 | 0.2508 |

## Top Answer Score vs Correctness

- Sample count: 13
- Mean confidence: 0.3965
- Mean label rate: 0.6154
- ECE (10 bins): 0.2189
- Brier: 0.3166

### Best Threshold (F1 Sweep)

- threshold=0.00 precision=0.6154 recall=1.0000 f1=0.7619 accuracy=0.6154

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.4436 | 0.7500 | 0.2500 |
| 50.00% | 7 | 0.4214 | 0.7143 | 0.2857 |
| 75.00% | 10 | 0.4103 | 0.7000 | 0.3000 |
| 100.00% | 13 | 0.0000 | 0.6154 | 0.3846 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 1.0000 | 1.0000 |
| [0.4, 0.5) | 12 | 0.4296 | 0.5833 | 0.1538 |

## Top Group Score vs Expected Answerability

- Sample count: 13
- Mean confidence: 0.4665
- Mean label rate: 0.7692
- ECE (10 bins): 0.3027
- Brier: 0.2192

### Best Threshold (F1 Sweep)

- threshold=0.05 precision=0.8333 recall=1.0000 f1=0.9091 accuracy=0.8462

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.5445 | 1.0000 | 0.0000 |
| 50.00% | 7 | 0.4972 | 0.8571 | 0.1429 |
| 75.00% | 10 | 0.4622 | 0.9000 | 0.1000 |
| 100.00% | 13 | 0.0000 | 0.7692 | 0.2308 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 0.0000 | 0.0000 |
| [0.4, 0.5) | 7 | 0.4741 | 0.8571 | 0.3831 |
| [0.5, 0.6) | 5 | 0.5492 | 0.8000 | 0.2508 |

## Top Answer Score vs Expected Answerability

- Sample count: 13
- Mean confidence: 0.3965
- Mean label rate: 0.7692
- ECE (10 bins): 0.3727
- Brier: 0.2749

### Best Threshold (F1 Sweep)

- threshold=0.05 precision=0.8333 recall=1.0000 f1=0.9091 accuracy=0.8462

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.4436 | 1.0000 | 0.0000 |
| 50.00% | 7 | 0.4214 | 0.8571 | 0.1429 |
| 75.00% | 10 | 0.4103 | 0.9000 | 0.1000 |
| 100.00% | 13 | 0.0000 | 0.7692 | 0.2308 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 0.0000 | 0.0000 |
| [0.4, 0.5) | 12 | 0.4296 | 0.8333 | 0.4038 |

## Answerability Context Shadow Calibrator vs Correctness (Baseline)

- Sample count: 13
- Mean confidence: 0.4665
- Mean label rate: 0.6154
- ECE (10 bins): 0.1979
- Brier: 0.2786

### Best Threshold (F1 Sweep)

- threshold=0.45 precision=0.7000 recall=0.8750 f1=0.7778 accuracy=0.6923

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.5445 | 1.0000 | 0.0000 |
| 50.00% | 7 | 0.4972 | 0.8571 | 0.1429 |
| 75.00% | 10 | 0.4622 | 0.7000 | 0.3000 |
| 100.00% | 13 | 0.0000 | 0.6154 | 0.3846 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 1.0000 | 1.0000 |
| [0.4, 0.5) | 7 | 0.4741 | 0.4286 | 0.0455 |
| [0.5, 0.6) | 5 | 0.5492 | 0.8000 | 0.2508 |

## Answerability Context Shadow Calibrator vs Correctness (Shadow Calibrated)

- Sample count: 13
- Mean confidence: 0.7013
- Mean label rate: 0.6154
- ECE (10 bins): 0.3393
- Brier: 0.3146

### Best Threshold (F1 Sweep)

- threshold=0.05 precision=0.7273 recall=1.0000 f1=0.8421 accuracy=0.7692

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.9894 | 0.5000 | 0.5000 |
| 50.00% | 7 | 0.9416 | 0.5714 | 0.4286 |
| 75.00% | 10 | 0.4710 | 0.7000 | 0.3000 |
| 100.00% | 13 | 0.0020 | 0.6154 | 0.3846 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 3 | 0.0304 | 0.3333 | 0.3029 |
| [0.4, 0.5) | 1 | 0.4710 | 1.0000 | 0.5290 |
| [0.7, 0.8) | 1 | 0.7911 | 1.0000 | 0.2089 |
| [0.9, 1.0] | 8 | 0.9705 | 0.6250 | 0.3455 |

## Answerability Context Shadow Calibrator vs Expected Answerability (Baseline)

- Sample count: 13
- Mean confidence: 0.4665
- Mean label rate: 0.7692
- ECE (10 bins): 0.3027
- Brier: 0.2192

### Best Threshold (F1 Sweep)

- threshold=0.05 precision=0.8333 recall=1.0000 f1=0.9091 accuracy=0.8462

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.5445 | 1.0000 | 0.0000 |
| 50.00% | 7 | 0.4972 | 0.8571 | 0.1429 |
| 75.00% | 10 | 0.4622 | 0.9000 | 0.1000 |
| 100.00% | 13 | 0.0000 | 0.7692 | 0.2308 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 0.0000 | 0.0000 |
| [0.4, 0.5) | 7 | 0.4741 | 0.8571 | 0.3831 |
| [0.5, 0.6) | 5 | 0.5492 | 0.8000 | 0.2508 |

## Answerability Context Shadow Calibrator vs Expected Answerability (Shadow Calibrated)

- Sample count: 13
- Mean confidence: 0.8828
- Mean label rate: 0.7692
- ECE (10 bins): 0.1696
- Brier: 0.1590

### Best Threshold (F1 Sweep)

- threshold=0.05 precision=0.8333 recall=1.0000 f1=0.9091 accuracy=0.8462

### Risk-Coverage

| Coverage | Kept | Min Confidence | Accuracy | Risk |
|---|---:|---:|---:|---:|
| 25.00% | 4 | 0.9965 | 0.5000 | 0.5000 |
| 50.00% | 7 | 0.9926 | 0.7143 | 0.2857 |
| 75.00% | 10 | 0.9338 | 0.8000 | 0.2000 |
| 100.00% | 13 | 0.0000 | 0.7692 | 0.2308 |

### Reliability Buckets

| Bucket | Count | Mean Confidence | Label Rate | Gap |
|---|---:|---:|---:|---:|
| [0.0, 0.1) | 1 | 0.0000 | 0.0000 | 0.0000 |
| [0.7, 0.8) | 1 | 0.7956 | 1.0000 | 0.2044 |
| [0.8, 0.9) | 1 | 0.8406 | 1.0000 | 0.1594 |
| [0.9, 1.0] | 10 | 0.9841 | 0.8000 | 0.1841 |

## High-Confidence Failures

| Case | Bank | Group Score | Answer Score | Correct | Expected Answerable | Predicted Answerable | Mode | Support Bucket | Top Anchor | Query | Answer |
|---|---|---:|---:|---:|---:|---:|---|---|---|---|---|
| N3 | negative_unanswerable | 0.5011 | 0.4269 | 0 | 0 | 1 | direct | lexically_supported | ep_why_supported | Why did Caroline pick the lunar adoption agency? | It offered inclusivity and support for LGBTQ+ folks |
| P3A | positive_reference | 0.4949 | 0.4436 | 0 | 1 | 1 | temporal | temporal_or_derived | ep_history_1998 | What happened on 1998-07-02? | 5 April 2026 |
| P4B | positive_reference | 0.4622 | 0.4103 | 0 | 1 | 1 | multi_anchor | lexically_supported | ep_rel_new | What is Caroline's current relationship status? | married; single |
| N2 | negative_unanswerable | 0.4431 | 0.4055 | 0 | 0 | 1 | direct | lexically_supported | ep_history_1998 | Which Mars colony did Caroline move to? | Caroline moved to Boston. |
| P4A | positive_reference | 0.4290 | 0.4169 | 0 | 1 | 1 | multi_anchor | lexically_supported | ep_rel_new | What is Caroline's relationship status? | married; single |

## Notes

- This script is eval-only and does not change runtime ranking or answer behavior.
- Confidence values are current runtime outputs (`EvidenceGroup.groupScore` and `Anchor.confidenceScore`), not retrained probabilities.
- The negative bank is intentionally hard and probes abstention behavior under unsupported queries.
