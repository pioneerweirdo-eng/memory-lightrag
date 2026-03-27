# Release Checklist (memory-lightrag)

## 1) Preconditions
- [ ] `openclaw plugins inspect memory-lightrag --json` shows `status: loaded`
- [ ] `diagnostics: []`
- [ ] memorySearch embeddings probe OK (`openclaw memory status --deep --json`)

## 2) Gate Verification
- [ ] Gate1 PASS (plugins inspect)
- [ ] Gate2 PASS (CLI deep evidence)
- [ ] Gate3 PASS (diagnostics empty)

## 3) Architecture Alignment Checks (new)
- [ ] Phase **P0** scope confirmed (score vector + confidence/margin + two tie-breaks only) — see [DIRECTOR_ROUTE_ALIGNMENT_AND_NEXT_STEPS_2026-03-27](DIRECTOR_ROUTE_ALIGNMENT_AND_NEXT_STEPS_2026-03-27.md)
- [ ] Thin control layer fences in place (routing shim isolated from ontology code)
- [ ] Ontology-native roadmap intact (P1 retrieval feedback + P2 ontology routing logged as follow-ups) — see [TARGET_ALIGNMENT_AND_BOUNDARIES](TARGET_ALIGNMENT_AND_BOUNDARIES.md)
- [ ] GENERAL intent definition reviewed to ensure positive signals exist (not only residual constraints) — see [memory-ontology](memory-ontology.md)
- [ ] Retrieval feedback telemetry captured for future P1 coupling (even if not yet gating decisions)

## 4) Artifacts
- [ ] Evidence files archived under [`docs/archived/`](archived/GATE_SUMMARY_2026-03-27.md)
- [ ] Gate summary present: [`docs/archived/GATE_SUMMARY_2026-03-27.md`](archived/GATE_SUMMARY_2026-03-27.md)
- [ ] Release ready page updated: [`docs/RELEASE_READY_STATUS_2026-03-27.md`](RELEASE_READY_STATUS_2026-03-27.md) with architecture snapshot

## 5) Regression Safety
- [ ] Run `openclaw memory search --query <smoke>` and confirm results
- [ ] Validate fallback (force lightrag baseUrl invalid for one run, then restore)
- [ ] Confirm retrieval feedback logging does not regress gate timings

## 6) Final
- [ ] Commit docs changes
- [ ] Push to master (subtree split)
- [ ] Create TODO entry for P1 retrieval feedback + P2 ontology-native routing alignment review
