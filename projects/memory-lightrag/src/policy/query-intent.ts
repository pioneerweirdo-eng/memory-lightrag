import { scoreIntentQuery } from "./intent-scorer";

export type QueryIntent = "WHY" | "WHEN" | "ENTITY" | "GENERAL";

export function detectQueryIntentDetailed(query: string) {
  const scoring = scoreIntentQuery(query);
  return {
    intent: scoring.decisionIntent,
    scoring,
  };
}

export function detectQueryIntent(query: string): QueryIntent {
  return detectQueryIntentDetailed(query).intent;
}
