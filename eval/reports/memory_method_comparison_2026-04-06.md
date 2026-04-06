# Memory Method Comparison - 2026-04-06

Method comparison under a fixed evaluation standard: same scenarios, same perturbations, same pass criteria.

- Intent eval mode: deterministic_only

## Standards

- Scenario pass rate: all query variants for a scenario pass the scenario-specific oracle.
- Query check pass rate: fraction of individual query instances that satisfy the oracle.
- Evidence consistency rate: paraphrase variants should preserve the same selected evidence, even if the answer wording compresses differently.
- These standards are method-independent and intended to reduce post-hoc metric gaming.

## Current Main

- Scenario pass rate: 100.00%
- Query check pass rate: 100.00%
- Evidence consistency rate: 100.00%
- Route consistency rate: 100.00%

### S1 - When query beats lexical echo

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: When did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026
- Query: What date did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026

### S2 - Entity query preserves semantic summary

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: How does Caroline identify now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman
- Query: What identity does Caroline report now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman

### S3 - Explicit history keeps old event

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What happened on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998
- Query: What happened before everything else on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998

### S4 - Superseded fact loses to replacement

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What is Caroline's relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married
- Query: What is Caroline's current relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married

### S5 - Supported why evidence beats pseudo lexical noise

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: Why did Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=It offered inclusivity and support for LGBTQ+ folks
- Query: What made Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=Caroline chose the adoption agency because it offered inclusivity and support for LGBTQ+ folks.

## Rank Only

- Scenario pass rate: 100.00%
- Query check pass rate: 100.00%
- Evidence consistency rate: 100.00%
- Route consistency rate: 100.00%

### S1 - When query beats lexical echo

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: When did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026
- Query: What date did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026

### S2 - Entity query preserves semantic summary

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: How does Caroline identify now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman
- Query: What identity does Caroline report now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman

### S3 - Explicit history keeps old event

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What happened on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998
- Query: What happened before everything else on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998

### S4 - Superseded fact loses to replacement

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What is Caroline's relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married
- Query: What is Caroline's current relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married

### S5 - Supported why evidence beats pseudo lexical noise

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: Why did Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=It offered inclusivity and support for LGBTQ+ folks
- Query: What made Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=Caroline chose the adoption agency because it offered inclusivity and support for LGBTQ+ folks.

## Route x Lane Guard

- Scenario pass rate: 100.00%
- Query check pass rate: 100.00%
- Evidence consistency rate: 100.00%
- Route consistency rate: 100.00%

### S1 - When query beats lexical echo

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: When did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026
- Query: What date did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026

### S2 - Entity query preserves semantic summary

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: How does Caroline identify now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman
- Query: What identity does Caroline report now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman

### S3 - Explicit history keeps old event

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What happened on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998
- Query: What happened before everything else on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998

### S4 - Superseded fact loses to replacement

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What is Caroline's relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married
- Query: What is Caroline's current relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married

### S5 - Supported why evidence beats pseudo lexical noise

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: Why did Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=It offered inclusivity and support for LGBTQ+ folks
- Query: What made Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=Caroline chose the adoption agency because it offered inclusivity and support for LGBTQ+ folks.

## Route x Lane + Recency

- Scenario pass rate: 100.00%
- Query check pass rate: 100.00%
- Evidence consistency rate: 100.00%
- Route consistency rate: 100.00%

### S1 - When query beats lexical echo

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: When did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026
- Query: What date did Caroline meet the counselor? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_when_recent/episodic | selected=ep_when_recent/episodic | answer=5 April 2026

### S2 - Entity query preserves semantic summary

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: How does Caroline identify now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman
- Query: What identity does Caroline report now? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=session_1_summary_identity/semantic_summary | selected=session_1_summary_identity/semantic_summary | answer=transgender woman

### S3 - Explicit history keeps old event

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What happened on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998
- Query: What happened before everything else on 1998-07-02? | route=when | provider=deterministic_only | selectedIntent=when | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_history_1998/episodic | selected=ep_history_1998/episodic | answer=2 July 1998

### S4 - Superseded fact loses to replacement

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: What is Caroline's relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married
- Query: What is Caroline's current relationship status? | route=general | provider=deterministic_only | selectedIntent=general | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_rel_new/episodic | selected=ep_rel_new/episodic | answer=married

### S5 - Supported why evidence beats pseudo lexical noise

- Status: PASS
- Query checks: 2/2
- Evidence consistency: PASS
- Route consistency: PASS

- Query: Why did Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=It offered inclusivity and support for LGBTQ+ folks
- Query: What made Caroline choose the adoption agency? | route=why | provider=deterministic_only | selectedIntent=why | deterministicIntent=n/a | modelIntent=n/a | fallback=none | top-ranked=ep_why_supported/episodic | selected=ep_why_supported/episodic | answer=Caroline chose the adoption agency because it offered inclusivity and support for LGBTQ+ folks.
