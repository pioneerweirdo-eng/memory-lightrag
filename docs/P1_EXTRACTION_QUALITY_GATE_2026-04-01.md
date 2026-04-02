# P1 Extraction Quality Gate

## Purpose

Define the minimum quality gate required before enabling graph write-path rollout for extracted memory objects.

Without this gate, P1 can write low-quality or fabricated objects into the graph and poison later retrieval.

## Evidence Basis

LightRAG explicitly notes that graph extraction places higher demands on LLM capability than traditional RAG and recommends:

- at least 32B parameters
- at least 32KB context, with 64KB recommended
- avoiding reasoning models during document indexing
- using the same embedding model for indexing and query

Official issue history also shows extraction failure modes with smaller/open models and API/runtime drift.

Sources:
- https://github.com/HKUDS/LightRAG
- https://github.com/HKUDS/LightRAG/issues/30
- https://github.com/HKUDS/LightRAG/issues/2138

## Gate Scope

Applies to object extraction for:

- `Episode`
- `Decision`
- `Preference`

Does not apply to plain `Source` records; those are provenance wrappers.

## Model Policy

### Indexing / extraction model
- should be configured independently from the answer model
- should follow LightRAG's stronger-model recommendation for extraction-heavy paths
- should not assume the same model as the final agent response model
- should use a dedicated extraction endpoint/config boundary
- must not reuse `LIGHTRAG_BASE_URL` / `LIGHTRAG_API_KEY` as model gateway settings

### Query model
- may be stronger than the indexing model
- must not silently rewrite extraction semantics

## Minimum Evaluation Set

Before P1 rollout, create an internal labeled set from:

- curated `MEMORY.md` samples
- selected `memory/YYYY-MM-DD.md` logs
- explicit correction examples

Each sample should be labeled for:

- object type
- canonical statement
- time information
- owner/participants
- provenance span

## Required Metrics

### 1. schema validity rate
- fraction of extracted objects that pass required-field validation

### 2. provenance completeness
- fraction of extracted objects with valid source attachment

### 3. type accuracy
- fraction of objects whose type matches annotation

### 4. unsupported-claim rate
- fraction of extracted fields not grounded in source text

### 5. fallback-to-raw rate
- fraction of cases that fail structured extraction and are downgraded to raw `Episode`

## Minimum Gate Thresholds

- schema validity rate >= 0.95
- provenance completeness >= 0.98
- type accuracy >= 0.85
- unsupported-claim rate <= 0.05
- fallback-to-raw rate reported for every batch

## Fallback Rule

If structured extraction is weak, invalid, or low-confidence:

- do not emit `Decision`, `Preference`, `Commitment`, or `Incident`
- write only a raw `Episode` with provenance
- mark it as `candidate`, not `promoted`

This prevents high-risk semantic pollution from weak extraction.

## Prompt Governance

Extraction prompt text must be:

- versioned
- stored in one project-owned location
- changed only with evaluation reruns

Implementation rule:
- do not scatter extraction instructions across inline strings in multiple modules

## Rollout Decision

P1 can proceed only when:

1. the labeled extraction set exists
2. the above thresholds are met
3. fallback-to-raw behavior is implemented
4. extraction model / embedding model versions are pinned in the batch report

## Current Status（2026-04-02）

Implemented:

- prompt registry exists (`src/write/extraction.ts`, EXTRACTION_SYSTEM_PROMPT v1, dated 2026-04-01)
- parse/validation logic exists (`parseExtractionResponse`, `validateMemoryObject`)
- fallback-to-raw `Episode` exists (returns empty objects → caller writes raw episode)
- LLM client integration exists (`src/llm/client.ts`)
- labeled extraction dataset (`eval/datasets/extraction_labeled_v1.json`, 31 samples)
- batch evaluation runner (`eval/run-extraction-eval.mjs`)
  - measures: schema validity rate, provenance completeness, type accuracy, unsupported-claim rate, fallback-to-raw rate
  - outputs: `eval/reports/extraction_eval_results_2026-04-02.md`
  - uses `EXTRACTION_*` environment variables for the extraction model endpoint
  - does not use `LIGHTRAG_*` variables for `/chat/completions`
  - gates: schema >= 0.95, provenance >= 0.98, type accuracy >= 0.85, unsupported-claim <= 0.05
  - **actual run**: gemini-3.1-flash-lite-preview · 31 samples · all gates passed

Not yet complete:

- correction semantics (supersedes/contradicts) — implemented in types + write path

## Extraction Eval Results（2026-04-02）

**Report**: `eval/reports/extraction_eval_results_2026-04-02.md`
**Model**: gemini-3.1-flash-lite-preview @ http://127.0.0.1:3000/v1
**Dataset**: extraction_labeled_v1.json · 31 samples · 0 skipped

| Metric | Actual | Threshold | Pass? |
|---|---|---|---|
| schema validity rate | **100.00%** | ≥ 95% | ✓ |
| provenance completeness | **100.00%** | ≥ 98% | ✓ |
| type accuracy | 90.32% | ≥ 85% | ✓ |
| unsupported-claim rate | 3.23% | ≤ 5% | ✓ |
| fallback-to-raw rate | 0.00% | (reported) | — |

**Per-kind schema validity**: episode 100% (16/16) · decision 100% (9/9) · preference 100% (6/6)

**Type accuracy per kind**: episode 93.75% · decision 88.89% · preference 83.33%

**Decision**: ✓ **ALL GATES PASSED — P1 production rollout is unblocked.**

## Boundary Rule

- LightRAG remains the graph storage/retrieval substrate
- extraction evaluation may call an independent model endpoint
- these two systems must not share the same `BASE_URL` variable name
