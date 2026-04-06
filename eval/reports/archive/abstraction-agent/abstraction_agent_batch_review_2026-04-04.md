# Abstraction Agent Batch Review — 2026-04-03T17:14:54.581Z

## Summary

- Total cases: 9
- Eligible for review: 7
- Preserved answer: 1
- Forced short unknown: 1
- Safe compression: 5
- Not triggered: 2
- Review errors: 0

## Cases

| Query | Cat | Eligible | Shape | Current Match | Current Support | Current Answer | Review Answer | Review Rationale |
|---|---|---|---|---|---|---|---|---|
| LOCOMO-conv_26-001 | 2 | Y | temporal | temporal_equivalent | temporal_or_derived | 7 May 2023 (2023-05-07) | 7 May 2023 | The evidence explicitly states Caroline went to the group 'yesterday' in a conversation timestamped 2023-05-08. Calculating back one day from the conversation date yields 2023-05-07. The current answer includes redundant formatting '(2023-05-07)' which violates the preference for short noun phrases or clauses and exceeds the spirit of brevity without adding value. |
| LOCOMO-conv_26-003 | 3 | Y | short_phrase | no_match | lexically_supported | mental health; counseling | mental health; counseling | The current answer 'mental health; counseling' is directly supported by Anchor 1 (Caroline states she is keen on 'counseling or working in mental health') and Anchor 3 (Caroline plans to check out career options). The evidence explicitly links these two specific fields to Caroline's educational and career intentions. No unsupported abstractions or additional fields can be added without violating the constraint to stay strictly inside returned evidence. |
| LOCOMO-conv_26-004 | 1 | Y | short_phrase | contains | lexically_supported | adoption agencies with the dream of having a family and providing a loving home to kids in need. | adoption agencies | The current answer includes excessive context ('with the dream of having a family...') which violates the 'short_phrase' shape and 'maxAnswerWords: 8' constraint. The evidence explicitly states Caroline is 'Researching adoption agencies'. Removing the motivational clause preserves the core fact while meeting the length and format requirements. |
| LOCOMO-conv_26-005 | 1 | N | n/a | exact | lexically_supported | transgender woman |  |  |
| LOCOMO-conv_26-006 | 2 | Y | temporal | no_match | temporal_or_derived | 25 May 2023 (2023-05-25) | 25 May 2023 | The current answer includes a redundant parenthetical date format '(2023-05-25)' which violates the 'short phrase' preference for noun phrases or very short clauses. The evidence (Anchor 1, 2, and 3) explicitly confirms the date as 2023-05-25. Removing the ISO format repetition improves conciseness while maintaining factual accuracy. |
| LOCOMO-conv_26-015 | 3 | Y | short_unknown | no_match | lexically_supported | mental health; counseling | insufficient evidence | The provided evidence confirms Caroline's current interest in counseling and the positive impact of support groups on her self-esteem. However, it contains no information regarding her hypothetical career aspirations if she had not received such support. Counterfactual outcomes cannot be determined from the available data. |
| LOCOMO-conv_26-083 | 4 | N | n/a | exact | lexically_supported | mental health |  |  |
| LOCOMO-conv_26-088 | 4 | Y | short_phrase | no_match | lexically_supported | Anything you're excited for in the adoption process; Caroline chose an adoption agency that helps LGBTQ+ folks with adoption due to their inclusivity and support | Inclusivity and support for LGBTQ+ folks | The current answer contains conversational noise ('Anything you're excited for...') which is not a reason for the choice. The revised answer extracts the core supported reason from the evidence (Anchor 1 and Anchor 2 details) regarding 'inclusivity and support' specifically for 'LGBTQ+ folks', adhering to the short_phrase format and word limit. |
| LOCOMO-conv_26-153 | 5 | Y | short_phrase | exact | lexically_supported | self-care is important. | Melanie realized self-care is important | The current answer 'self-care is important' lacks the necessary subject. Anchor 3 explicitly states that Melanie (not Caroline) realized this after the event ('I'm starting to realize that self-care is really important'). The revised answer corrects the subject attribution while remaining a short phrase. |

## Raw

```json
[
  {
    "id": "LOCOMO-conv_26-001",
    "category": 2,
    "query": "When did Caroline go to the LGBTQ support group?",
    "gold": "7 May 2023",
    "currentAnswer": "7 May 2023 (2023-05-07)",
    "currentMode": "temporal",
    "currentSupport": "temporal_or_derived",
    "currentMatch": "temporal_equivalent",
    "eligible": true,
    "triggerReasons": [
      "context_completion_required"
    ],
    "answerShape": "temporal",
    "maxWords": 6,
    "reviewAccepted": false,
    "reviewAnswer": "7 May 2023",
    "reviewRationale": "The evidence explicitly states Caroline went to the group 'yesterday' in a conversation timestamped 2023-05-08. Calculating back one day from the conversation date yields 2023-05-07. The current answer includes redundant formatting '(2023-05-07)' which violates the preference for short noun phrases or clauses and exceeds the spirit of brevity without adding value.",
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-003",
    "category": 3,
    "query": "What fields would Caroline be likely to pursue in her educaton?",
    "gold": "Psychology, counseling certification",
    "currentAnswer": "mental health; counseling",
    "currentMode": "multi_anchor",
    "currentSupport": "lexically_supported",
    "currentMatch": "no_match",
    "eligible": true,
    "triggerReasons": [
      "context_completion_required",
      "multi_anchor_synthesis"
    ],
    "answerShape": "short_phrase",
    "maxWords": 8,
    "reviewAccepted": true,
    "reviewAnswer": "mental health; counseling",
    "reviewRationale": "The current answer 'mental health; counseling' is directly supported by Anchor 1 (Caroline states she is keen on 'counseling or working in mental health') and Anchor 3 (Caroline plans to check out career options). The evidence explicitly links these two specific fields to Caroline's educational and career intentions. No unsupported abstractions or additional fields can be added without violating the constraint to stay strictly inside returned evidence.",
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-004",
    "category": 1,
    "query": "What did Caroline research?",
    "gold": "Adoption agencies",
    "currentAnswer": "adoption agencies with the dream of having a family and providing a loving home to kids in need.",
    "currentMode": "direct",
    "currentSupport": "lexically_supported",
    "currentMatch": "contains",
    "eligible": true,
    "triggerReasons": [
      "verbose_answer_compression"
    ],
    "answerShape": "short_phrase",
    "maxWords": 8,
    "reviewAccepted": false,
    "reviewAnswer": "adoption agencies",
    "reviewRationale": "The current answer includes excessive context ('with the dream of having a family...') which violates the 'short_phrase' shape and 'maxAnswerWords: 8' constraint. The evidence explicitly states Caroline is 'Researching adoption agencies'. Removing the motivational clause preserves the core fact while meeting the length and format requirements.",
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-005",
    "category": 1,
    "query": "What is Caroline's identity?",
    "gold": "Transgender woman",
    "currentAnswer": "transgender woman",
    "currentMode": "direct",
    "currentSupport": "lexically_supported",
    "currentMatch": "exact",
    "eligible": false,
    "triggerReasons": [],
    "answerShape": "n/a",
    "maxWords": null,
    "reviewAccepted": null,
    "reviewAnswer": null,
    "reviewRationale": null,
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-006",
    "category": 2,
    "query": "When did Melanie run a charity race?",
    "gold": "The sunday before 25 May 2023",
    "currentAnswer": "25 May 2023 (2023-05-25)",
    "currentMode": "temporal",
    "currentSupport": "temporal_or_derived",
    "currentMatch": "no_match",
    "eligible": true,
    "triggerReasons": [
      "context_completion_required"
    ],
    "answerShape": "temporal",
    "maxWords": 6,
    "reviewAccepted": false,
    "reviewAnswer": "25 May 2023",
    "reviewRationale": "The current answer includes a redundant parenthetical date format '(2023-05-25)' which violates the 'short phrase' preference for noun phrases or very short clauses. The evidence (Anchor 1, 2, and 3) explicitly confirms the date as 2023-05-25. Removing the ISO format repetition improves conciseness while maintaining factual accuracy.",
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-015",
    "category": 3,
    "query": "Would Caroline still want to pursue counseling as a career if she hadn't received support growing up?",
    "gold": "Likely no",
    "currentAnswer": "mental health; counseling",
    "currentMode": "multi_anchor",
    "currentSupport": "lexically_supported",
    "currentMatch": "no_match",
    "eligible": true,
    "triggerReasons": [
      "context_completion_required",
      "multi_anchor_synthesis"
    ],
    "answerShape": "short_unknown",
    "maxWords": 4,
    "reviewAccepted": false,
    "reviewAnswer": "insufficient evidence",
    "reviewRationale": "The provided evidence confirms Caroline's current interest in counseling and the positive impact of support groups on her self-esteem. However, it contains no information regarding her hypothetical career aspirations if she had not received such support. Counterfactual outcomes cannot be determined from the available data.",
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-083",
    "category": 4,
    "query": "What did the charity race raise awareness for?",
    "gold": "mental health",
    "currentAnswer": "mental health",
    "currentMode": "direct",
    "currentSupport": "lexically_supported",
    "currentMatch": "exact",
    "eligible": false,
    "triggerReasons": [],
    "answerShape": "n/a",
    "maxWords": null,
    "reviewAccepted": null,
    "reviewAnswer": null,
    "reviewRationale": null,
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-088",
    "category": 4,
    "query": "Why did Caroline choose the adoption agency?",
    "gold": "because of their inclusivity and support for LGBTQ+ individuals",
    "currentAnswer": "Anything you're excited for in the adoption process; Caroline chose an adoption agency that helps LGBTQ+ folks with adoption due to their inclusivity and support",
    "currentMode": "multi_anchor",
    "currentSupport": "lexically_supported",
    "currentMatch": "no_match",
    "eligible": true,
    "triggerReasons": [
      "context_completion_required",
      "multi_anchor_synthesis",
      "verbose_answer_compression",
      "prefix_noise_cleanup"
    ],
    "answerShape": "short_phrase",
    "maxWords": 8,
    "reviewAccepted": false,
    "reviewAnswer": "Inclusivity and support for LGBTQ+ folks",
    "reviewRationale": "The current answer contains conversational noise ('Anything you're excited for...') which is not a reason for the choice. The revised answer extracts the core supported reason from the evidence (Anchor 1 and Anchor 2 details) regarding 'inclusivity and support' specifically for 'LGBTQ+ folks', adhering to the short_phrase format and word limit.",
    "reviewError": ""
  },
  {
    "id": "LOCOMO-conv_26-153",
    "category": 5,
    "query": "What did Caroline realize after her charity race?",
    "gold": "self-care is important",
    "currentAnswer": "self-care is important.",
    "currentMode": "multi_anchor",
    "currentSupport": "lexically_supported",
    "currentMatch": "exact",
    "eligible": true,
    "triggerReasons": [
      "multi_anchor_synthesis"
    ],
    "answerShape": "short_phrase",
    "maxWords": 8,
    "reviewAccepted": false,
    "reviewAnswer": "Melanie realized self-care is important",
    "reviewRationale": "The current answer 'self-care is important' lacks the necessary subject. Anchor 3 explicitly states that Melanie (not Caroline) realized this after the event ('I'm starting to realize that self-care is really important'). The revised answer corrects the subject attribution while remaining a short phrase.",
    "reviewError": ""
  }
]
```