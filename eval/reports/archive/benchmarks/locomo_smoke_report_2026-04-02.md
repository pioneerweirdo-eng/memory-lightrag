# LoCoMo-Derived Graph Smoke Report — 2026-04-02T17:18:53.080Z

## Scope

- This is a gray-test graph smoke, not the official LoCoMo benchmark.
- It uses official LoCoMo data as the source dataset.
- It validates that a tiny category-covering subset can be written to LightRAG and read back through the graph-native recall path.

## Configuration

| Parameter | Value |
|---|---|
| Dataset | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo10.json |
| Sample | conv-26 |
| Workspace | bench_locomo_smoke_2026-04-02T17-18-48-562Z_conv_26 |
| Session limit | 2 |
| Sessions used | 1, 2 |
| Categories used | 1, 2, 3, 4, 5 |
| Profiles | baseline |
| Seed success | 51/51 |
| Index ready | yes |
| Index wait | 784 ms / 1 attempt(s) / gold-anchor-visible |

## Profile Summary

| Profile | Evidence Recall@K | Graph Grounded | Graph Direct | Graph Temporal | Graph Context | Flat Direct | Flat Temporal | Flat Context |
|---|---|---|---|---|---|---|---|---|
| baseline | 100.00% | 100.00% | 60.00% | 20.00% | 0.00% | 40.00% | 20.00% | 0.00% |

## Profile: baseline

| Query | Cat | Evidence Hit | Graph Grounded | Graph Match Mode | Flat Match Mode | Anchors |
|---|---|---|---|---|---|---|
| LOCOMO-conv_26-004 | 1 | Y | Y | contains | contains | 5 |
| LOCOMO-conv_26-001 | 2 | Y | Y | temporal_equivalent | temporal_equivalent | 5 |
| LOCOMO-conv_26-003 | 3 | Y | Y | no_match | no_match | 5 |
| LOCOMO-conv_26-083 | 4 | Y | Y | exact | contains | 5 |
| LOCOMO-conv_26-153 | 5 | Y | Y | exact | no_match | 5 |

## Selected Queries

- LOCOMO-conv_26-004 | category=1 | evidence=["D2:8"] | answer=Adoption agencies | context_required=no | neighborhood_turns=3
- LOCOMO-conv_26-001 | category=2 | evidence=["D1:3"] | answer=7 May 2023 | context_required=yes | neighborhood_turns=3
- LOCOMO-conv_26-003 | category=3 | evidence=["D1:9","D1:11"] | answer=Psychology, counseling certification | context_required=yes | neighborhood_turns=5
- LOCOMO-conv_26-083 | category=4 | evidence=["D2:2"] | answer=mental health | context_required=no | neighborhood_turns=3
- LOCOMO-conv_26-153 | category=5 | evidence=["D2:3"] | answer=self-care is important | context_required=no | neighborhood_turns=3

---
*LoCoMo-derived graph smoke v2026-04-02 · small LightRAG write/read validation only*