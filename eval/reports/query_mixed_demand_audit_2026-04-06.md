# Query Mixed-Demand Audit - 2026-04-06

Offline prevalence audit for mixed-demand / boundary queries.

## Recall-Labeled Dataset

- Total queries: 15
- Two or more active recall axes: 11 (73.33%)
- Three active recall axes: 3 (20.00%)
- Temporal + multi-hop cases currently collapsed to route=when: 6
- Correction + multi-hop cases in recall task: 6

### Representative Recall Mixed-Demand Cases

- RQ-001 | axes=multi_hop+temporal | route=when | semanticCompanion=true | mode=mix | query=what happened with memory-lightrag on 2026-03-28
- RQ-003 | axes=multi_hop+correction | route=policy | semanticCompanion=false | mode=local | query=what decision was made about session-logs workflow
- RQ-004 | axes=multi_hop+temporal | route=when | semanticCompanion=false | mode=mix | query=what embedding model issue was identified on 2026-03-25
- RQ-006 | axes=multi_hop+correction | route=when | semanticCompanion=true | mode=mix | query=what was decided about the GENERAL-WHEN confusion pair rollout
- RQ-007 | axes=multi_hop+temporal | route=when | semanticCompanion=true | mode=mix | query=what happened during the Gate2 CLI deep retry route on 2026-03-22
- RQ-008 | axes=multi_hop+temporal | route=general | semanticCompanion=false | mode=mix | query=what path confusion was identified on 2026-03-27
- RQ-009 | axes=multi_hop+correction | route=when | semanticCompanion=true | mode=mix | query=what rule was established about production deployment when offline and live accuracy differ
- RQ-010 | axes=multi_hop+temporal+correction | route=general | semanticCompanion=false | mode=mix | query=what was the conclusion about Gate3 production readiness on 2026-03-31

## Intent Trainset Boundary Tags

- Total rows: 224
- Boundary-tagged rows: 15 (6.70%)
- entity-boundary: 2
- entity-general-boundary: 1
- policy-ish: 1
- pronoun-why: 1
- recap-vs-temporal: 2
- scope-drift: 1
- temporal-causal: 2
- temporal-entity: 2
- why-entity-boundary: 3

### Representative Boundary Queries

- AUGT012 | label=WHY | route=why | tags=entity-boundary | query=为什么昨天负责的人突然换了
- AUGT014 | label=WHY | route=why | tags=policy-ish | query=因为什么我们把 GENERAL 的门槛又调高了
- AUGT037 | label=GENERAL | route=general | tags=recap-vs-temporal | query=上次我们聊到哪了
- AUGT040 | label=GENERAL | route=entity | tags=entity-boundary | query=总结一下这次回滚谁参与了以及最后怎么收尾
- AUGT041 | label=ENTITY | route=when | tags=temporal-entity | query=最近谁一直在改这个模块
- AUGT042 | label=ENTITY | route=why | tags=why-entity-boundary | query=是谁导致这次回滚审批卡住的
- AUGT043 | label=WHY | route=why | tags=temporal-causal | query=为什么周二晚上开始出现第一波告警
- AUGT044 | label=WHY | route=general | tags=scope-drift | query=上次我们不是说要收口吗，怎么又扩到 tool routing 了
- AUGT045 | label=GENERAL | route=when | tags=entity-general-boundary | query=把最近谁改了什么、最后结论是什么，打个概括版
- AUGC005 | label=WHY | route=why | tags=pronoun-why | query=为什么他后来就不回消息了
- AUGC013 | label=ENTITY | route=entity | tags=why-entity-boundary | query=谁让这次回滚审批通过的
- AUGC019 | label=GENERAL | route=general | tags=recap-vs-temporal | query=上次我们讨论到哪一步了

## Confusion Routing Set

- Total rows: 46
- Ambiguous rows: 6
- Tie-break rows: 6

### Representative Ambiguous / Tie-Break Queries

- CR-AMB001 | expected=undefined | route=when | tags=ambiguous,confusion-GENERAL-WHEN | query=recently, what has changed
- CR-AMB002 | expected=undefined | route=general | tags=ambiguous,confusion-GENERAL-WHEN | query=最近有什么变化
- CR-AMB003 | expected=undefined | route=when | tags=ambiguous,confusion-GENERAL-WHEN | query=anything interesting happen last week
- CR-AMB004 | expected=undefined | route=general | tags=ambiguous,confusion-GENERAL-WHEN | query=上周有没有特别的进展
- CR-TIE001 | expected=undefined | route=when | tags=tie-break,confusion-GENERAL-WHEN | query=when was the last time memory felt stable
- CR-TIE002 | expected=undefined | route=when | tags=tie-break,confusion-GENERAL-WHEN | query=上次系统稳定是什么时候
- CR-TIE003 | expected=undefined | route=when | tags=tie-break,confusion-GENERAL-ENTITY | query=who was managing things when the issue happened
- CR-TIE004 | expected=undefined | route=entity | tags=tie-break,confusion-GENERAL-ENTITY | query=出问题的时候负责人是谁

## Reading

- In recall-labeled tasks, mixed-demand is common rather than exceptional once temporal, relation/multi-hop, and correction are counted together.
- In intent training data, explicit mixed-boundary tags are present but still a minority slice; this means router-only metrics understate the structure of the recall problem.
- Current query-profile still emits one primary routeIntent, so mixed-demand information is partially compressed even when semanticCompanion/modeHint preserve some secondary signal.
