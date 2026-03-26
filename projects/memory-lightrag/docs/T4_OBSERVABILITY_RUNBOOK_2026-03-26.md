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
