# Memory Semantics Audit - 2026-04-06

Offline audit over synthetic scenarios that exercise the current recall stack without changing runtime logic.

- Total scenarios: 5
- PASS: 5
- GAP: 0
- Intent eval mode: python_stdio(tools/intent-classifier/hybrid-artifacts_augmented_v2/hybrid_with_dense, shadow=off, minConfidence=0.6)

## Overall Reading

- This audit focuses on current behavior for episodic vs semantic selection, explicit history handling, supersession demotion, and lexical-noise resistance.
- A GAP means the current architecture did not satisfy the desired memory behavior in that scenario.

## S1 - When query prefers recent episodic evidence over older lexical noise

- Objective: Check whether current route-aware RRF can keep temporal episodic evidence above a noisy lexical echo.
- Status: PASS
- Summary: 3/3 checks passed
- Route / intent provider: when / python_stdio
- Intent decisions: selected=WHEN deterministic=WHEN model=WHEN fallback=none
- Ranked IDs: ep_when_recent, ep_when_noise
- Ranked lanes: episodic, episodic
- Selected IDs: ep_when_recent
- Selected lanes: episodic
- Top group dominant anchor: ep_when_recent
- Top group value: Caroline met the counselor.
- Answer: 5 April 2026
- Answer mode/support: temporal/temporal_or_derived

### Top Ranked Breakdown

- Ranked[1] ep_when_recent (episodic) | rank=0.9561 confidence=0.4436 group=0.8179 lexical=0.5173 semantic=0.0000 support=0.4956 temporal=0.7000
- Ranked[2] ep_when_noise (episodic) | rank=0.9371 confidence=0.3669 group=0.7147 lexical=0.6163 semantic=0.0000 support=0.1956 temporal=0.4450

- PASS - Top ranked anchor is the recent event | expected: ep_when_recent | actual: ep_when_recent
- PASS - Selected anchor keeps the recent event | expected: ep_when_recent | actual: ep_when_recent
- PASS - Rendered answer stays temporal | expected: temporal answer mentioning 5 April 2026 or 2026-04-05 | actual: 5 April 2026

## S2 - Entity query should preserve top semantic summary evidence

- Objective: Audit the known risk that anchor selection still hard-prefers episodic lanes even when semantic evidence ranks first.
- Status: PASS
- Summary: 3/3 checks passed
- Route / intent provider: entity / python_stdio
- Intent decisions: selected=ENTITY deterministic=GENERAL model=ENTITY fallback=none
- Ranked IDs: session_1_summary_identity, ep_identity_generic
- Ranked lanes: semantic_summary, episodic
- Selected IDs: session_1_summary_identity
- Selected lanes: semantic_summary
- Top group dominant anchor: session_1_summary_identity
- Top group value: transgender woman
- Answer: transgender woman
- Answer mode/support: direct/lexically_supported

### Top Ranked Breakdown

- Ranked[1] session_1_summary_identity (semantic_summary) | rank=0.9794 confidence=0.4169 group=0.8342 lexical=0.2613 semantic=0.2129 support=0.4956 temporal=0.9702
- Ranked[2] ep_identity_generic (episodic) | rank=0.6214 confidence=0.4169 group=0.5837 lexical=0.2016 semantic=0.0000 support=0.4956 temporal=0.9716

- PASS - Top ranked anchor is the semantic summary | expected: session_1_summary_identity | actual: session_1_summary_identity
- PASS - Top selected anchor is still the semantic summary | expected: session_1_summary_identity | actual: session_1_summary_identity
- PASS - User-facing answer retains the identity fact | expected: answer contains transgender woman | actual: transgender woman

## S3 - Explicit history query keeps old episodic evidence visible

- Objective: Check whether explicit-date history questions can still surface historical episodic memory instead of recent distractors.
- Status: PASS
- Summary: 2/2 checks passed
- Route / intent provider: when / python_stdio
- Intent decisions: selected=WHEN deterministic=WHEN model=WHEN fallback=none
- Ranked IDs: ep_history_1998, ep_history_recent
- Ranked lanes: episodic, episodic
- Selected IDs: ep_history_1998
- Selected lanes: episodic
- Top group dominant anchor: ep_history_1998
- Top group value: Caroline moved to Boston.
- Answer: 2 July 1998
- Answer mode/support: temporal/temporal_or_derived

### Top Ranked Breakdown

- Ranked[1] ep_history_1998 (episodic) | rank=0.9574 confidence=0.4436 group=0.8189 lexical=0.1637 semantic=0.0000 support=0.4956 temporal=1.0000
- Ranked[2] ep_history_recent (episodic) | rank=0.8816 confidence=0.2159 group=0.6968 lexical=0.0704 semantic=0.0000 support=0.2656 temporal=0.0000

- PASS - Top ranked anchor is the 1998 event | expected: ep_history_1998 | actual: ep_history_1998
- PASS - Rendered answer stays tied to the explicit historical event | expected: temporal answer mentioning 1998 | actual: 2 July 1998

## S4 - Superseded memory is demoted by newer evidence

- Objective: Check whether correction/supersession signals prevent stale facts from outranking their replacement.
- Status: PASS
- Summary: 3/3 checks passed
- Route / intent provider: general / deterministic_fallback
- Intent decisions: selected=GENERAL deterministic=GENERAL model=GENERAL fallback=low_confidence
- Ranked IDs: ep_rel_new, ep_rel_old
- Ranked lanes: episodic, episodic
- Selected IDs: ep_rel_new
- Selected lanes: episodic
- Top group dominant anchor: ep_rel_new
- Top group value: married
- Answer: married
- Answer mode/support: direct/lexically_supported

### Top Ranked Breakdown

- Ranked[1] ep_rel_new (episodic) | rank=0.6965 confidence=0.4169 group=0.6363 lexical=0.3080 semantic=0.0000 support=0.4956 temporal=0.5000
- Ranked[2] ep_rel_old (episodic) | rank=0.6957 confidence=0.3245 group=0.5961 lexical=0.3337 semantic=0.0000 support=0.3636 temporal=0.5000

- PASS - Top ranked anchor is the newer replacement fact | expected: ep_rel_new | actual: ep_rel_new
- PASS - Top evidence group is the newer value | expected: married | actual: married
- PASS - Rendered answer reflects the replacement fact | expected: married | actual: married

## S5 - Weak lexical pseudo-noise should not outrank supported why evidence

- Objective: Check whether answerable supported evidence stays above an exact lexical noise chunk in a why-style query.
- Status: PASS
- Summary: 3/3 checks passed
- Route / intent provider: why / python_stdio
- Intent decisions: selected=WHY deterministic=WHY model=WHY fallback=none
- Ranked IDs: ep_why_supported, pseudo:noise_why_question:Why did Caroline choose the adoption age
- Ranked lanes: episodic, pseudo
- Selected IDs: ep_why_supported
- Selected lanes: episodic
- Top group dominant anchor: ep_why_supported
- Top group value: Caroline chose the adoption agency because it offered inclusivity and support for LGBTQ+ folks.
- Answer: It offered inclusivity and support for LGBTQ+ folks
- Answer mode/support: direct/lexically_supported

### Top Ranked Breakdown

- Ranked[1] ep_why_supported (episodic) | rank=0.8362 confidence=0.4626 group=0.7340 lexical=0.3840 semantic=0.0000 support=0.4956 temporal=0.5000
- Ranked[2] pseudo:noise_why_question:Why did Caroline choose the adoption age (pseudo) | rank=0.3682 confidence=0.0000 group=0.2577 lexical=0.5800 semantic=0.0000 support=0.0000 temporal=0.5000

- PASS - Top ranked anchor is the supported structured object | expected: ep_why_supported | actual: ep_why_supported
- PASS - Selected anchor is not pseudo-noise | expected: episodic structured evidence | actual: ep_why_supported (episodic)
- PASS - Rendered answer keeps the supported reason phrase | expected: answer contains inclusivity and support | actual: It offered inclusivity and support for LGBTQ+ folks
