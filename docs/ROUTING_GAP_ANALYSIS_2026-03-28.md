# ROUTING_GAP_ANALYSIS_2026-03-28

## Purpose

Compare the current `memory-lightrag` routing implementation against the target direction in [`DIRECTOR_ROUTE_ALIGNMENT_AND_NEXT_STEPS_2026-03-27`](DIRECTOR_ROUTE_ALIGNMENT_AND_NEXT_STEPS_2026-03-27.md).

This analysis focuses on:
- what P0 capabilities are already implemented,
- what P0 pieces are still missing,
- what belongs to P1/P2 instead of immediate patching,
- what the next minimal code tasks should be.

---

## Executive judgment

Current `memory-lightrag` is **already beyond pure rule-order routing**, but it is still only a **partial P0 implementation**.

It already has:
- a 4-class score space (`WHY / WHEN / ENTITY / GENERAL`),
- threshold-based safe fallback to `GENERAL`,
- positive `GENERAL` signals,
- intent-conditioned rerank weights,
- basic route telemetry.

It does **not yet** have:
- explicit pairwise tie-break modules for the two high-value confusion pairs,
- a dedicated routing module boundary (`intent-routing.ts`) that isolates decision logic cleanly,
- retrieval-aware scoring inputs,
- evaluation targeted at confusion-pair behavior and abstention quality.

So the right reading is:
- **P0 = partially implemented**
- **P1 = not implemented**
- **P2 = not implemented**

---

## 1. What is already implemented (P0 present now)

### 1.1 Four-class score space exists
Current code already models the four intended classes:
- `WHY`
- `WHEN`
- `ENTITY`
- `GENERAL`

Evidence:
- [`src/policy/query-intent.ts`](../src/policy/query-intent.ts)
- [`src/policy/intent-features.ts`](../src/policy/intent-features.ts)
- [`src/policy/intent-scorer.ts`](../src/policy/intent-scorer.ts)

This means the project is **not** operating as a simple compatibility rule chain only.

### 1.2 Score-based routing already exists
`detectQueryIntentDetailed()` already supports:
- scored routing enable/disable,
- profile-based thresholds (`strict / default / recall`),
- `minTopScore`,
- `minMargin`,
- route decision telemetry,
- `GENERAL` safe fallback when score or margin is weak.

This is a real P0 foundation.

### 1.3 GENERAL is already a positive class, not only a residue bucket
Current implementation already assigns positive signals to `GENERAL`, including:
- weak/general query patterns,
- summary-style requests,
- broad low-specificity prompts.

That aligns well with the Director document’s warning that GENERAL must not be defined only by absence.

### 1.4 Thin control layer is already visible in rerank wiring
The current routing output feeds rerank policy selection:
- [`src/policy/rerank-policy.ts`](../src/policy/rerank-policy.ts)
- [`src/index.ts`](../src/index.ts)

This is consistent with the short-term control-layer framing: route first, bias retrieval second.

### 1.5 Basic observability exists
Telemetry already includes fields like:
- `routeMode`
- `decisionReason`
- `topIntent`
- `topScore`
- `secondScore`
- `margin`
- threshold snapshot

This means the project already has the beginning of the observability surface Director asked for.

---

## 2. What is still missing in P0

### 2.1 No explicit pairwise tie-break modules yet
Director’s recommended P0 specifically says to add only two pairwise tie-breaks:
- `GENERAL vs WHEN`
- `GENERAL vs ENTITY`

Current code does **not** implement them as explicit modules.
Instead, it uses generic score thresholds plus a couple of ambiguity guards:
- weak temporal without event anchor → GENERAL
- bare entity noun without role hints → GENERAL

These heuristics are useful, but they are **not the same thing** as explicit pairwise tie-break logic.

### 2.2 Routing logic is still spread across feature / scorer / compatibility logic
The Director doc recommends a clearer boundary such as:
- `intent-routing.ts`
- `tiebreak/`
- `observability.ts`

Current logic is functionally present, but architecturally spread across:
- `query-intent.ts`
- `intent-features.ts`
- `intent-scorer.ts`
- rerank wiring in `index.ts`

So the behavior exists, but the code boundary is not yet as clean or evolvable as it should be.

### 2.3 No explicit abstention-quality evaluation loop yet
The Director doc says P0 should measure more than accuracy.
Current repo has eval assets, but the implementation path shown in code does not yet expose a dedicated confusion-pair / abstention evaluation contract for:
- GENERAL recall
- GENERAL↔WHEN confusion
- GENERAL↔ENTITY confusion
- ambiguous rate
- tie-break rescue rate

So the runtime side is ahead of the evaluation discipline.

---

## 3. What belongs to P1 (not immediate P0 patching)

### 3.1 Retrieval-aware routing is still missing
This is the biggest gap after P0.
Current routing is still query-surface dominant.
It does **not yet** incorporate retrieval-derived evidence such as:
- temporal concentration in recalled evidence,
- entity concentration / dominant node evidence,
- relation support,
- broad mixed evidence pattern.

That means the system has not yet crossed the bridge from query-only control to retrieval-aware routing.

### 3.2 No feedback loop from graph evidence back into routing
Ontology output appears in details and retrieval surfaces, but it is not yet part of the route decision loop itself.
This is exactly the missing bridge Director calls out.

---

## 4. What belongs to P2 (strategic, not now)

### 4.1 Ontology-native routing is not implemented
Current code does not derive route classes from graph evidence types or relation structure.
It still classifies primarily from the query itself.

### 4.2 Graph is not yet a first-class reasoning source for route disambiguation
The graph currently supports retrieval/evidence, but not strategic route selection.
So ontology is still supportive, not central.

This is acceptable for now, but it confirms the project is still far from the long-term target.

---

## 5. Recommended next minimal code tasks

### Task A — Add explicit pairwise tie-break modules
Create a small `src/policy/tiebreak/` layer with exactly two modules:
- `general-vs-when.ts`
- `general-vs-entity.ts`

Goal:
- keep pairwise logic visible and bounded,
- avoid continued growth of ad hoc inline heuristics.

### Task B — Introduce a clean `intent-routing.ts` boundary
Move route decision composition into one orchestrating module that owns:
- score vector output,
- thresholding,
- margin logic,
- pairwise tie-break entry,
- route mode output.

This is mostly architecture cleanup, but it reduces future drift.

### Task C — Add a dedicated routing observability contract
Standardize one telemetry object for routing decisions.
It should explicitly log:
- raw scores,
- normalized scores,
- thresholds,
- route mode,
- decision reason,
- confusion pair tag (when relevant).

### Task D — Add confusion-focused eval coverage
Do not start P1 before adding targeted evaluation for:
- GENERAL recall
- GENERAL precision
- GENERAL↔WHEN confusion
- GENERAL↔ENTITY confusion
- ambiguous rate
- tie-break rescue rate

---

## 6. Guardrail assessment

### Good news
Current code is **not drifting into a giant feature zoo yet**.
The feature set is still finite and understandable.

### Main risk
If the project keeps patching edge cases only by adding more query-surface patterns, it will drift away from the intended architecture.

### Therefore
The next implementation step should be:
1. finish P0 cleanly,
2. then move toward retrieval-aware routing,
3. not expand handcrafted features indefinitely.

---

## Final recommendation

### Current phase label
- **Current implementation phase:** P0-in-progress / partially landed

### Immediate engineering priority
- finish P0 cleanly with explicit tie-break + routing boundary + observability contract

### Strategic priority after that
- move to P1 retrieval-aware routing before adding more handcrafted feature complexity

### One-sentence decision
`memory-lightrag` already has a real scored-routing foundation, but it still needs one clean P0 consolidation pass before it should invest in P1 retrieval-aware logic.
