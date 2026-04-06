# LoCoMo-Derived Graph Smoke Report — 2026-04-03T08:36:29.696Z

## Scope

- This is a gray-test graph smoke, not the official LoCoMo benchmark.
- It uses official LoCoMo data as the source dataset.
- It validates that a tiny category-covering subset can be written to LightRAG and read back through the graph-native recall path.

## Configuration

| Parameter | Value |
|---|---|
| Dataset | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo10.json |
| Sample | conv-26 |
| Workspace | bench_locomo_smoke_post_isolation_2026-04-03T16-40-00_conv_26 |
| Session limit | 2 |
| Sessions used | 1, 2 |
| Categories used | 1, 2, 3, 4, 5 |
| Profiles | baseline |
| Seed success | 51/51 |
| Index ready | yes |
| Index wait | 3472 ms / 1 attempt(s) / grounded-answer-visible |

## Profile Summary

| Profile | Evidence Recall@K | Graph Grounded | Graph Direct | Graph Temporal | Graph Context | Flat Direct | Flat Temporal | Flat Context |
|---|---|---|---|---|---|---|---|---|
| baseline | 0.00% | 100.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% | 0.00% |

## Profile: baseline

| Query | Cat | Evidence Hit | Graph Grounded | Graph Match Mode | Flat Match Mode | Anchors |
|---|---|---|---|---|---|---|
| LOCOMO-conv_26-004 | 1 | N | Y | no_match | no_match | 1 |
| LOCOMO-conv_26-001 | 2 | N | Y | no_match | no_match | 1 |
| LOCOMO-conv_26-003 | 3 | N | Y | no_match | no_match | 1 |
| LOCOMO-conv_26-083 | 4 | N | Y | no_match | no_match | 1 |
| LOCOMO-conv_26-153 | 5 | N | Y | no_match | no_match | 2 |

## Selected Queries

- LOCOMO-conv_26-004 | category=1 | evidence=["D2:8"] | answer=Adoption agencies | context_required=no | neighborhood_turns=3
- LOCOMO-conv_26-001 | category=2 | evidence=["D1:3"] | answer=7 May 2023 | context_required=yes | neighborhood_turns=3
- LOCOMO-conv_26-003 | category=3 | evidence=["D1:9","D1:11"] | answer=Psychology, counseling certification | context_required=yes | neighborhood_turns=5
- LOCOMO-conv_26-083 | category=4 | evidence=["D2:2"] | answer=mental health | context_required=no | neighborhood_turns=3
- LOCOMO-conv_26-153 | category=5 | evidence=["D2:3"] | answer=self-care is important | context_required=no | neighborhood_turns=3

---
*LoCoMo-derived graph smoke v2026-04-02 · small LightRAG write/read validation only*