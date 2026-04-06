# Answer Intent Shadow Compare - 2026-04-04T13:10:14.471Z

## Scope

- Current: weak-prior answerIntent behavior from the working tree.
- Legacy baseline: replay of the pre-refactor heuristic answerIntent shaping rules reconstructed from the prior online logic.
- Important note: this repository does not contain a committed historical artifact for the immediate pre-refactor abstraction-agent file, so the legacy trigger comparison is a rule-faithful replay, not a git-restored artifact.

## Visible Dataset Drift

| Dataset | Rows | Drift | Current answerIntent histogram | Legacy answerIntent histogram |
| --- | ---: | ---: | --- | --- |
| dev_visible.json | 90 | 0 | generic:89, research:1 | generic:89, research:1 |
| calibration_visible.json | 24 | 0 | generic:24 | generic:24 |
| confusion_routing_v1.json | 46 | 0 | generic:46 | generic:46 |

No visible-dataset drifts were observed.

## Hard Case Metrics

- Hard case dataset: `eval\datasets\career_fields_hard_case.json` (15 rows)
- Current accuracy: 80.00%
- Legacy accuracy: 66.67%
- Current career_fields precision / recall: 100.00% / 62.50%
- Legacy career_fields precision / recall: 80.00% / 50.00%
- Current temporal+education/career mixed misclassification rate: 0.00%
- Legacy temporal+education/career mixed misclassification rate: 25.00%

| Id | Expected | Current | Legacy | Tags | Query |
| --- | --- | --- | --- | --- | --- |
| HC001 | career_fields | career_fields | generic | broad_career, english | What direction might her education go next? |
| HC002 | career_fields | career_fields | career_fields | broad_career, chinese | 她未来可能会往什么职业方向发展？ |
| HC003 | career_fields | generic | generic | broad_career, english | What kind of work might she move into over time? |
| HC004 | career_fields | generic | career_fields | broad_career, chinese | 她后续更适合继续走哪条职业路径？ |
| HC005 | career_fields | career_fields | generic | qualification, english | What qualifications might she want to add next? |
| HC006 | career_fields | generic | generic | qualification, chinese | 她接下来可能会补哪类资质？ |
| HC007 | career_fields | career_fields | career_fields | broad_career, english | Which field seems closest to her longer-term plans? |
| HC008 | career_fields | career_fields | career_fields | broad_career, chinese | 她未来更像会往什么专业方向靠拢？ |
| HC009 | generic | generic | generic | temporal_mixed, english | When did she start continuing her education? |
| HC010 | generic | generic | generic | temporal_mixed, chinese | 她是什么时候开始考虑职业方向的？ |
| HC011 | generic | generic | career_fields | temporal_mixed, english | Which day did she get that certification? |
| HC012 | generic | generic | generic | temporal_mixed, chinese | 她哪天拿到那张证书的？ |
| HC013 | research | research | research | research, english | Help me research the differences between AriGraph and G-Memory. |
| HC014 | relationship_status | relationship_status | relationship_status | relationship, chinese | 她现在是什么关系状态？ |
| HC015 | identity | identity | identity | identity, mixed_language | Caroline 现在是什么身份认同？ |

## Ranking Fixtures

- Broad conversational anchor wins: current 1/3, legacy 1/3

| Fixture | Expected anchor | Current answer | Current anchor | Legacy answer | Legacy anchor |
| --- | --- | --- | --- | --- | --- |
| RF001 | ep_career_dialog | counseling or working in mental health.; Psychology and counseling certification | ep_career_dialog, ep_career_summary | Psychology and counseling certification | ep_career_summary |
| RF002 | ep_career_broad | A portal mentioned a leadership certificate | ep_career_credential | Caroline wants to keep working in community support and advocacy | ep_career_broad |
| RF003 | ep_cn_broad | 项目管理认证 | ep_cn_cert | 项目管理认证 | ep_cn_cert |

## Abstraction Trigger Comparison

- Current trigger histogram: context_completion_required:1, partial_support_review:1, prefix_noise_cleanup:1, unsupported_abstraction_risk:1, verbose_answer_compression:1
- Legacy trigger histogram: career_field_abstraction:2, context_completion_required:1, partial_support_review:1, prefix_noise_cleanup:1, unsupported_abstraction_risk:1, verbose_answer_compression:1

| Fixture | Current intent | Current reasons | Legacy intent | Legacy reasons |
| --- | --- | --- | --- | --- |
| AF001 | career_fields | unsupported_abstraction_risk, context_completion_required | career_fields | unsupported_abstraction_risk, context_completion_required, career_field_abstraction |
| AF002 | career_fields | partial_support_review | career_fields | partial_support_review, career_field_abstraction |
| AF003 | generic | verbose_answer_compression, prefix_noise_cleanup | generic | verbose_answer_compression, prefix_noise_cleanup |

## Readout

- The weak-prior version improves broad career-shape recognition by 12.50pp on the hard-case set.
- The weak-prior version changes temporal mixed-question behavior by -25.00pp misclassification rate.
- In the crafted ranking fixtures, the broad grounded anchor wins 1 times for current vs 1 times for legacy.
- Legacy-only career_field_abstraction trigger count: 2. Current count: 0.
