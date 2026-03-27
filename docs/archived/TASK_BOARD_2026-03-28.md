# Memory-Lightrag Task Board (2026-03-28)

## Workflow
Inbox → Assigned → In Progress → Review → Done

## Constraints
- All git changes must stay within `projects/memory-engine-plugin/memory-lightrag/`
- Parallel work is allowed only for non-overlapping file sets / non-conflicting concerns
- Deliverables should be PR-ready branches or clean commits scoped to memory-lightrag only

## Active Tasks

### T1 — Docs architecture alignment
- State: Assigned
- Goal: Apply DIRECTOR route alignment into core docs (`RELEASE_READY_STATUS`, `RELEASE_CHECKLIST`, `INDEX`)
- Scope: docs only
- Owner: builder-docs
- Review: reviewer-docs

### T2 — README / docs hyperlink polish
- State: Assigned
- Goal: Add internal markdown links consistently across README and key docs
- Scope: README + docs navigation only
- Owner: builder-nav
- Review: reviewer-docs

### T3 — Core routing implementation gap analysis
- State: Assigned
- Goal: Compare current codebase vs DIRECTOR_ROUTE_ALIGNMENT doc and identify P0 features not yet implemented
- Scope: analysis doc only, no code changes yet
- Owner: builder-analysis
- Review: reviewer-code

### T4 — Gate2/tool details visibility follow-up
- State: Assigned
- Goal: Analyze whether tool details should be exposed via payload or documented as CLI-deep-only, with recommendation
- Scope: analysis doc only
- Owner: builder-analysis-2
- Review: reviewer-code
