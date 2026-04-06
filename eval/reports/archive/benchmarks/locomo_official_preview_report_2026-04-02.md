# LoCoMo Official Preview Report — 2026-04-02T11:44:24.327Z

## Configuration

| Parameter | Value |
|---|---|
| Source dataset | C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo10.json |
| Write to LightRAG | no |
| Official schema only | yes |
| Sample limit | all |
| Preview limit | 3 |

## Official Contract

- RAG databases: `["dialog","observation","summary"]`
- Required top-level fields: `["sample_id","conversation","observation","session_summary","event_summary","qa"]`
- Required QA base fields: `["question","evidence","category"]`
- Category-specific answer fields: `{"1":["answer"],"2":["answer"],"3":["answer"],"4":["answer"],"5":["adversarial_answer"]}`

## Dataset Audit

| Metric | Value |
|---|---|
| Samples | 10 |
| Session count range | 19..32 |
| QA count range | 105..260 |
| Conversation turn count range | 369..689 |
| Event count range | 25..95 |
| Missing top-level field samples | 0 |
| Missing QA fields | 0 |
| Missing observations | 0 |
| Missing session summaries | 0 |
| Missing event summaries | 0 |
| Missing session date_times | 0 |
| Malformed conversation turns | 0 |

### Category Histogram

`{"1":282,"2":321,"3":96,"4":841,"5":446}`

### Evidence Cardinality Histogram

`{"0":4,"1":1559,"2":239,"3":83,"4":58,"5":20,"6":6,"7":7,"8":2,"9":2,"10":2,"11":2,"17":1,"19":1}`

### Top-Level Issue Histogram

`{}`

### QA Issue Histogram

`{}`

### Sample Preview

`[{"sample_id":"conv-26","session_count":19,"qa_count":199,"conversation_turn_count":419,"event_count":25,"first_qa":{"question":"When did Caroline go to the LGBTQ support group?","answer":"7 May 2023","category":2,"evidence":["D1:3"]}},{"sample_id":"conv-30","session_count":19,"qa_count":105,"conversation_turn_count":369,"event_count":29,"first_qa":{"question":"When Jon has lost his job as a banker?","answer":"19 January, 2023","category":2,"evidence":["D1:2"]}},{"sample_id":"conv-41","session_count":32,"qa_count":193,"conversation_turn_count":663,"event_count":95,"first_qa":{"question":"Who did Maria have dinner with on May 3, 2023?","answer":"her mother","category":2,"evidence":["D13:16"]}}]`

### Preview Files

- JSON preview: C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\datasets\locomo_official_preview.json
- This report: C:\Users\24787\.openclaw\workspace\agents\director\projects\memory-engine-plugin\memory-lightrag\eval\reports\locomo_official_preview_report_2026-04-02.md

---
*LoCoMo preview builder v2026-04-02 · official schema audit only*