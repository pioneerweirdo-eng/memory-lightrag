# T4 Observability Runbook (Ontology Filtering)

Date: 2026-03-26  
Scope: `memory-lightrag` tool-call `details.ontologyPolicy` and `details.ontology.filtering`

## 1) How to interpret `dropRate`

Field path:
- `details.ontology.filtering.sources.dropRate`

Definition:
- `dropRate = dropped / before` (if `before===0`, dropRate is `0`)
- Rounded to 4 decimals in runtime output

Companion counters (always read together):
- `before`: raw source count from graph
- `after`: source count after domain filtering
- `dropped`: removed source count

Quick interpretation:
- `0.00 ~ 0.10`: expected in permissive domains or cleanly scoped memory
- `0.10 ~ 0.40`: moderate filtering; check if expected for shared/group contexts
- `> 0.40`: high filtering pressure; likely recall quality impact
- `> 0.70`: severe filtering; strongly suspect source-tag mismatch or overly strict domain policy

> Note: thresholds are operational heuristics, not hard correctness bounds.

---

## 2) When to suspect overly strict source filtering

Look for this pattern in the same call:

1. `details.ontology.filtering.sources.dropRate` is high (typically >0.4)
2. `details.ontology.stats.sourceCount` is very low (often 0~2)
3. `details.ontology.filtering.relationsByEvidence.dropped` is high
4. User reports “can’t find known memory” or recall gets generic/empty

Why this happens:
- Sources are filtered by domain checks (`isAllowedByDomain`) using source tags from:
  - `source.uri`
  - `source.metadata.filePath`
  - fallback source id
- If these tags do not align with domain/workspace conventions, valid evidence may be excluded.

---

## 3) Quick troubleshooting steps

1. **Confirm policy context**
   - Check `details.domain`, `details.workspace`, `details.reasonCode`
   - Ensure request was routed to expected domain/workspace

2. **Check intent policy is present and sane**
   - `details.ontologyPolicy.intent`
   - `details.ontologyPolicy.rerankWeights`
   - Missing policy on non-empty query indicates instrumentation gap

3. **Inspect filtering counters**
   - Compare `sources.before` vs `sources.after`
   - Compare `relationsByEvidence.before` vs `after`
   - If relations collapse after evidence pruning, root cause is usually source filtering

4. **Spot-check sampled sources/relations**
   - `details.ontology.sources` (top 20)
   - `details.ontology.relations` (top 20)
   - Verify evidence IDs and source tags are in expected namespace/path

5. **Validate source-tag mapping assumptions**
   - Runtime source tag derivation prioritizes: `uri` → `metadata.filePath` → `id`
   - If upstream only provides opaque IDs, domain checks may over-drop

6. **Remediation options**
   - Normalize upstream source `uri`/`filePath` to match domain rules
   - Adjust domain policy/tagging strategy (if truly too strict)
   - Re-run the same query and compare dropRate + relation retention

---

## 4) Minimal operator checklist

- [ ] `details.ontologyPolicy` exists for non-empty query
- [ ] `dropRate` not persistently high for normal queries
- [ ] `relationsByEvidence.after` remains non-zero for evidence-heavy queries
- [ ] sampled `sources` and `relations` reflect expected workspace/domain

If all four fail repeatedly, escalate as **policy/data contract mismatch** between LightRAG metadata and domain filtering rules.

---

## 5) T5 GENERAL disambiguation runbook

Scope: investigate false positives/negatives where `details.ontologyPolicy.intent` returns `GENERAL` unexpectedly (or fails to return `GENERAL` for ambiguous prompts).

### 5.1 Fast triage

1. Capture the exact query string and resulting `details.ontologyPolicy.intent`.
2. Check whether query includes explicit cues from current detector:
   - WHY cues: `why`, `reason`, `cause`, `因为/原因/导致/...`
   - WHEN cues: `when`, `yesterday`, `recently`, `今天/近期/...`
   - ENTITY cues: strong (`who/where/谁/哪里`) or noun+hint (`team/project/service/owner/负责/...`)
3. Apply precedence mentally: `WHY -> WHEN -> ENTITY -> GENERAL`.

### 5.2 Common GENERAL false positives (should be specific intent)

Symptoms:
- Query has explicit temporal/entity/causal cues, but `intent=GENERAL`.

Checks:
- Compare query variant (plural/synonym/Chinese wording) against regex coverage in `detectQueryIntent`.
- Re-run `npm run verify:intent-rerank` and confirm boundary cases still pass.
- Add a targeted regression in `test/intent-rerank.verify.mjs` before changing patterns.

### 5.3 Common GENERAL false negatives (should stay GENERAL)

Symptoms:
- Vague prompts like `what should we do next` get classified as `ENTITY`.

Checks:
- Confirm whether only ambiguous question words (`what/which/什么/哪个`) are present with no strong companion hints.
- Ensure ENTITY classification is not triggered by incidental noun matches in user phrasing.
- Validate against T5 boundary set in `generalBoundaryCases`.

### 5.4 Required telemetry fields for incident notes

- `details.ontologyPolicy.intent`
- `details.ontologyPolicy.rerankWeights`
- (if retrieval quality affected) `details.ontology.filtering.sources.before/after/dropped/dropRate`
- (if relation evidence collapses) `details.ontology.filtering.relationsByEvidence.before/after/dropped`

These are the canonical operator-visible fields; keep naming consistent in docs and reports.
