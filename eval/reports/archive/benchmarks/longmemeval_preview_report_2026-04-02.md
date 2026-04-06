# LongMemEval Preview Report — 2026-04-02T11:28:02.196Z

## Configuration

| Parameter | Value |
|---|---|
| Dataset input | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets |
| Write to LightRAG | no |
| Official scorer first | yes |
| Preview limit | 5 |

## Official Contract

- Required fields: `["question_id","question_type","question","answer","question_date","haystack_session_ids","haystack_dates","haystack_sessions","answer_session_ids"]`
- Official files: `["longmemeval_oracle.json","longmemeval_s_cleaned.json","longmemeval_m_cleaned.json","longmemeval_s.json","longmemeval_m.json"]`
- Expected QA output format: `{"question_id": "...", "hypothesis": "..."}`

## Dataset Audit

### longmemeval_s_cleaned.json

| Metric | Value |
|---|---|
| Variant | longmemeval_s |
| Total instances | 500 |
| Retrieval-eligible instances | 470 |
| Abstention instances | 30 |
| Expected sorted haystack | yes |
| Duplicate question ids | 0 |
| Invalid question dates | 0 |
| Invalid haystack-date instances | 0 |
| Haystack length mismatches | 0 |
| Answer-session subset violations | 0 |
| Unsorted haystacks | 211 |
| Malformed-turn instances | 7 |
| Missing evidence labels | 0 |

Task families: `{"abstention":30,"knowledge-update":72,"multi-session":121,"single-session-assistant":56,"single-session-preference":30,"single-session-user":64,"temporal-reasoning":127}`

Issues: `{"answer-empty":32,"duplicate-haystack-session-ids:1":13,"haystack-dates-not-sorted":211,"malformed-turns:1":5,"malformed-turns:3":1,"malformed-turns:4":1}`

Warnings: `{"abstention-has-answer-session-ids":30}`

Preview: `[{"question_id":"e47becba","question_type":"single-session-user","benchmark_task_family":"single-session-user","question_date":"2023/05/30 (Tue) 23:40","haystack_session_count":53,"answer_session_count":1,"total_turn_count":550,"has_answer_turn_count":2,"question":"What degree did I graduate with?","answer":"Business Administration"},{"question_id":"118b2229","question_type":"single-session-user","benchmark_task_family":"single-session-user","question_date":"2023/05/30 (Tue) 20:36","haystack_session_count":45,"answer_session_count":1,"total_turn_count":485,"has_answer_turn_count":1,"question":"How long is my daily commute to work?","answer":"45 minutes each way"},{"question_id":"51a45a95","question_type":"single-session-user","benchmark_task_family":"single-session-user","question_date":"2023/05/30 (Tue) 20:42","haystack_session_count":50,"answer_session_count":1,"total_turn_count":529,"has_answer_turn_count":1,"question":"Where did I redeem a $5 coupon on coffee creamer?","answer":"Target"},{"question_id":"58bf7951","question_type":"single-session-user","benchmark_task_family":"single-session-user","question_date":"2023/05/30 (Tue) 22:53","haystack_session_count":57,"answer_session_count":1,"total_turn_count":616,"has_answer_turn_count":1,"question":"What play did I attend at the local community theater?","answer":"The Glass Menagerie"},{"question_id":"1e043500","question_type":"single-session-user","benchmark_task_family":"single-session-user","question_date":"2023/05/30 (Tue) 19:19","haystack_session_count":50,"answer_session_count":1,"total_turn_count":510,"has_answer_turn_count":1,"question":"What is the name of the playlist I created on Spotify?","answer":"Summer Vibes"}]`

## Preview Files

- JSON preview: C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\longmemeval_preview.json
- This report: C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\reports\longmemeval_preview_report_2026-04-02.md

---
*LongMemEval preview builder v2026-04-02 · offline schema audit only*