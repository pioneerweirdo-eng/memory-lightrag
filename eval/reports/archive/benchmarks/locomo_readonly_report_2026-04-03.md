# LoCoMo Readonly Comparison Report — 2026-04-03T16:01:05.030Z

## Scope

- This is a read-only comparison over an existing LightRAG workspace.
- It does not write any new LoCoMo data.
- It is intended to compare retrieval profiles on a stable benchmark workspace.

## Configuration

| Parameter | Value |
|---|---|
| Dataset | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo10.json |
| Sample | conv-26 |
| Workspace | bench_locomo_smoke_post_isolation_2026-04-03T16-40-00_conv_26 |
| Session limit | 2 |
| Categories used | 1, 2, 3, 4, 5 |
| Profiles | baseline, expanded-budget, query-aware |

## Profile Summary

| Profile | Evidence Recall@K | Graph Grounded | Graph Direct | Graph Temporal | Graph Context | Upstream Miss | Rerank Miss | Abstraction Gap | Source Unsupported Gold |
|---|---|---|---|---|---|---|---|---|---|
| baseline | 100.00% | 100.00% | 60.00% | 20.00% | 0.00% | 0.00% | 0.00% | 20.00% | 20.00% |
| expanded-budget | 100.00% | 100.00% | 60.00% | 20.00% | 0.00% | 0.00% | 0.00% | 20.00% | 20.00% |
| query-aware | 100.00% | 100.00% | 60.00% | 20.00% | 0.00% | 0.00% | 0.00% | 20.00% | 20.00% |

## Profile: baseline

| Query | Cat | Evidence Hit | Graph Grounded | Graph Match Mode | Flat Match Mode | Recovery Bucket | Abstraction Gap | Gold Support | Missing Gold Tokens | Graph Answer | Anchors | Ent | Rel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LOCOMO-conv_26-004 | 1 | Y | Y | contains | contains | selected | N | lexically_supported |  | adoption agencies with the dream of having a family and providing a loving home to kids in need. | 5 | 30 | 37 |
| LOCOMO-conv_26-001 | 2 | Y | Y | temporal_equivalent | temporal_equivalent | selected | N | temporal_or_derived |  | 7 May 2023 (2023-05-07) | 5 | 24 | 48 |
| LOCOMO-conv_26-003 | 3 | Y | Y | no_match | no_match | selected | Y | unsupported_gold_abstraction_likely | psychology, certification | mental health; counseling | 5 | 29 | 36 |
| LOCOMO-conv_26-083 | 4 | Y | Y | exact | contains | selected | N | lexically_supported |  | mental health | 5 | 30 | 36 |
| LOCOMO-conv_26-153 | 5 | Y | Y | exact | no_match | selected | N | partially_supported |  | self-care is important. | 5 | 32 | 40 |

## Profile: expanded-budget

| Query | Cat | Evidence Hit | Graph Grounded | Graph Match Mode | Flat Match Mode | Recovery Bucket | Abstraction Gap | Gold Support | Missing Gold Tokens | Graph Answer | Anchors | Ent | Rel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LOCOMO-conv_26-004 | 1 | Y | Y | contains | contains | selected | N | lexically_supported |  | adoption agencies with the dream of having a family and providing a loving home to kids in need. | 5 | 30 | 38 |
| LOCOMO-conv_26-001 | 2 | Y | Y | temporal_equivalent | temporal_equivalent | selected | N | temporal_or_derived |  | 7 May 2023 (2023-05-07) | 5 | 24 | 48 |
| LOCOMO-conv_26-003 | 3 | Y | Y | no_match | no_match | selected | Y | unsupported_gold_abstraction_likely | psychology, certification | mental health; counseling | 5 | 31 | 40 |
| LOCOMO-conv_26-083 | 4 | Y | Y | exact | contains | selected | N | lexically_supported |  | mental health | 5 | 28 | 38 |
| LOCOMO-conv_26-153 | 5 | Y | Y | exact | no_match | selected | N | partially_supported |  | self-care is important. | 5 | 32 | 40 |

## Profile: query-aware

| Query | Cat | Evidence Hit | Graph Grounded | Graph Match Mode | Flat Match Mode | Recovery Bucket | Abstraction Gap | Gold Support | Missing Gold Tokens | Graph Answer | Anchors | Ent | Rel |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| LOCOMO-conv_26-004 | 1 | Y | Y | contains | contains | selected | N | lexically_supported |  | adoption agencies with the dream of having a family and providing a loving home to kids in need. | 5 | 27 | 33 |
| LOCOMO-conv_26-001 | 2 | Y | Y | temporal_equivalent | temporal_equivalent | selected | N | temporal_or_derived |  | 7 May 2023 (2023-05-07) | 5 | 29 | 37 |
| LOCOMO-conv_26-003 | 3 | Y | Y | no_match | no_match | selected | Y | unsupported_gold_abstraction_likely | psychology, certification | mental health; counseling | 5 | 30 | 38 |
| LOCOMO-conv_26-083 | 4 | Y | Y | exact | contains | selected | N | lexically_supported |  | mental health | 5 | 18 | 26 |
| LOCOMO-conv_26-153 | 5 | Y | Y | exact | no_match | selected | N | partially_supported |  | self-care is important. | 5 | 40 | 48 |

## Remaining Mismatches

- baseline | LOCOMO-conv_26-003 | gold=Psychology, counseling certification | graph=mental health; counseling | gold_support=unsupported_gold_abstraction_likely | evidence=["D1:9","D1:11"]
- expanded-budget | LOCOMO-conv_26-003 | gold=Psychology, counseling certification | graph=mental health; counseling | gold_support=unsupported_gold_abstraction_likely | evidence=["D1:9","D1:11"]
- query-aware | LOCOMO-conv_26-003 | gold=Psychology, counseling certification | graph=mental health; counseling | gold_support=unsupported_gold_abstraction_likely | evidence=["D1:9","D1:11"]

## Selected Queries

- LOCOMO-conv_26-004 | category=1 | evidence=["D2:8"] | answer=Adoption agencies | context_required=no
- LOCOMO-conv_26-001 | category=2 | evidence=["D1:3"] | answer=7 May 2023 | context_required=yes
- LOCOMO-conv_26-003 | category=3 | evidence=["D1:9","D1:11"] | answer=Psychology, counseling certification | context_required=yes
- LOCOMO-conv_26-083 | category=4 | evidence=["D2:2"] | answer=mental health | context_required=no
- LOCOMO-conv_26-153 | category=5 | evidence=["D2:3"] | answer=self-care is important | context_required=no

---
*LoCoMo readonly comparison v2026-04-03 · existing workspace only*