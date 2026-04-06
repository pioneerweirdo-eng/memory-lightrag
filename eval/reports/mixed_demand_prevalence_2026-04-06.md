# Mixed-Demand Prevalence Audit - 2026-04-06

Goal: estimate whether mixed-demand retrieval/control is common enough in current visible datasets to justify more than localized ranking/calibration work.

## Intent Augmented Trainset

- Dataset: `eval\datasets\intent_trainset_v2_augmented.jsonl`
- Rows: 224
- Rows with explicit mixed-boundary tags: 15 (6.70%)
- Mixed-boundary tags tracked: temporal-entity, temporal-causal, why-entity-boundary, entity-general-boundary, recap-vs-temporal, entity-boundary, scope-drift, policy-ish, pronoun-why
- Top tag counts: why-entity-boundary (3), entity-boundary (2), recap-vs-temporal (2), temporal-causal (2), temporal-entity (2), entity-general-boundary (1), policy-ish (1), pronoun-why (1), scope-drift (1)

- AUGT012: 为什么昨天负责的人突然换了
- AUGT014: 因为什么我们把 GENERAL 的门槛又调高了
- AUGT037: 上次我们聊到哪了
- AUGT040: 总结一下这次回滚谁参与了以及最后怎么收尾
- AUGT041: 最近谁一直在改这个模块
- AUGT042: 是谁导致这次回滚审批卡住的
- AUGT043: 为什么周二晚上开始出现第一波告警
- AUGT044: 上次我们不是说要收口吗，怎么又扩到 tool routing 了

## Career Fields Hard Cases

- Dataset: `eval\datasets\career_fields_hard_case.json`
- Rows: 15
- Temporal mixed rows: 4 (26.67%)
- Cross-facet rows (research / relationship / identity): 3 (20.00%)

- HC009: When did she start continuing her education?
- HC010: 她是什么时候开始考虑职业方向的？
- HC011: Which day did she get that certification?
- HC012: 她哪天拿到那张证书的？

- HC013: Help me research the differences between AriGraph and G-Memory.
- HC014: 她现在是什么关系状态？
- HC015: Caroline 现在是什么身份认同？

## Recall Labeled V1

- Dataset: `eval\datasets\recall_labeled_v1.json`
- Rows: 15
- Multi-hop rows: 11 (73.33%)
- Temporal rows: 8 (53.33%)
- Correction rows: 6 (40.00%)
- Multi-hop + temporal: 8 (53.33%)
- Multi-hop + correction: 6 (40.00%)
- Temporal + correction: 3 (20.00%)

- RQ-001: what happened with memory-lightrag on 2026-03-28
- RQ-004: what embedding model issue was identified on 2026-03-25
- RQ-007: what happened during the Gate2 CLI deep retry route on 2026-03-22
- RQ-008: what path confusion was identified on 2026-03-27
- RQ-010: what was the conclusion about Gate3 production readiness on 2026-03-31
- RQ-011: when was the plugin loading test first successful
- RQ-012: what confusion pairs were added after the 2026-03-24 holdout eval
- RQ-014: what happened on 2026-03-23 with intent routing deployment

## Decision

- Mixed-demand structure is real enough to justify continued offline experiments.
- The stronger immediate signal is on recall tasks, not on single-label intent replay.
- Proceed with EvidenceGroup shadow ranking and calibration before any serving-path control-vector rewrite.

---
*Prevalence audit: visible datasets only. This is a prioritization probe, not a production traffic estimate.*