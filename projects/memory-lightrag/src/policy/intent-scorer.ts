import type { QueryIntent } from "./query-intent";
import {
  argMaxIntent,
  extractIntentFeatures,
  softmaxNormalized,
  topTwo,
  type IntentFeatures,
} from "./intent-features";

export type IntentScoreMap = Record<QueryIntent, number>;

export interface IntentScoringResult {
  features: IntentFeatures;
  rawScores: IntentScoreMap;
  normalizedScores: IntentScoreMap;
  topIntent: QueryIntent;
  topScore: number;
  secondScore: number;
  margin: number;
  minTopScore: number;
  minMargin: number;
  decisionIntent: QueryIntent;
}

const SCORE_THRESHOLDS = {
  minTopScore: 0.42,
  minMargin: 0.08,
};

const RECENT_TIME_MARKERS =
  /\b(yesterday|today|tomorrow|recent(?:ly)?|last\s+(?:night|week|month|year)|this\s+(?:morning|afternoon|evening|week|month|year))\b|昨天|今天|明天|最近|近期|上周|上个月|去年|今年/i;

const STRONG_WHEN_MARKERS =
  /\b(when|before|after|during)\b|什么时候|何时|几点|哪天|多久|先后|之前|之后|期间/i;

const WEAK_WHEN_TOPIC_MARKERS = /\b(time|date|timeline)\b|时间|日期|时间线/i;

function scoreWhy(features: IntentFeatures): number {
  return (
    features.causalStrong * 3.0 -
    features.temporalExplicit * 0.4 -
    features.temporalContext * 0.1 -
    features.generalWeak * 0.8 -
    features.summaryRequest * 0.6
  );
}

function scoreWhen(features: IntentFeatures): number {
  return (
    features.temporalExplicit * 2.2 +
    features.temporalContext * 1.2 +
    features.temporalEventAnchor * 1.3 +
    features.ambiguousQuestion * 0.2 -
    features.causalStrong * 1.5 -
    features.generalWeak * 0.8
  );
}

function scoreEntity(features: IntentFeatures): number {
  return (
    features.entityStrong * 2.1 +
    features.entityNoun * 1.2 +
    features.entityHint * 1.1 +
    features.ambiguousQuestion * 0.1 -
    features.causalStrong * 1.0 -
    features.generalWeak * 0.6 -
    features.summaryRequest * 0.8
  );
}

function scoreGeneral(features: IntentFeatures): number {
  return (
    features.generalWeak * 1.4 +
    features.summaryRequest * 1.0 +
    features.ambiguousQuestion * 0.2 -
    features.causalStrong * 0.7 -
    features.temporalExplicit * 0.5 -
    features.entityStrong * 0.4
  );
}

function decideByRules(features: IntentFeatures): QueryIntent | null {
  const q = features.query;

  // Fixed compatibility precedence: WHY -> WHEN -> ENTITY -> GENERAL.
  if (features.causalStrong > 0) return "WHY";

  // Summary-like requests should default to GENERAL unless explicit causal/when markers exist.
  if (features.summaryRequest > 0 && features.causalStrong === 0 && features.temporalExplicit === 0) {
    return "GENERAL";
  }

  // Strong temporal markers (except weak topical-only timeline/time/date prompts).
  if (STRONG_WHEN_MARKERS.test(q)) {
    if (WEAK_WHEN_TOPIC_MARKERS.test(q) && features.temporalEventAnchor === 0 && features.ambiguousQuestion > 0) {
      // e.g. "what is the timeline" should stay GENERAL.
    } else {
      return "WHEN";
    }
  }

  // Recent/dated markers should still win over ENTITY for compatibility.
  if (RECENT_TIME_MARKERS.test(q)) return "WHEN";

  // Weak temporal topic requires event anchor when question is ambiguous.
  if (
    WEAK_WHEN_TOPIC_MARKERS.test(q) &&
    features.temporalEventAnchor > 0 &&
    features.ambiguousQuestion > 0
  ) {
    return "WHEN";
  }

  if (features.entityStrong > 0) return "ENTITY";
  if ((features.entityNoun > 0 || features.entityHint > 0) && features.summaryRequest === 0) return "ENTITY";

  if (features.generalWeak > 0) return "GENERAL";

  return null;
}

export function scoreIntentQuery(query: string): IntentScoringResult {
  const features = extractIntentFeatures(query);

  const rawScores: IntentScoreMap = {
    WHY: scoreWhy(features),
    WHEN: scoreWhen(features),
    ENTITY: scoreEntity(features),
    GENERAL: scoreGeneral(features),
  };

  const normalizedScores = softmaxNormalized(rawScores);
  const topIntent = argMaxIntent(normalizedScores);
  const [topScore, secondScore] = topTwo(normalizedScores);
  const margin = topScore - secondScore;

  const ruleDecision = decideByRules(features);

  const weakTemporalOnly =
    WEAK_WHEN_TOPIC_MARKERS.test(features.query) &&
    features.temporalEventAnchor === 0 &&
    features.temporalExplicit === 0 &&
    features.ambiguousQuestion > 0;

  const thresholdDecision: QueryIntent = weakTemporalOnly
    ? "GENERAL"
    : topScore >= SCORE_THRESHOLDS.minTopScore && margin >= SCORE_THRESHOLDS.minMargin
      ? topIntent
      : "GENERAL";

  return {
    features,
    rawScores,
    normalizedScores,
    topIntent,
    topScore,
    secondScore,
    margin,
    minTopScore: SCORE_THRESHOLDS.minTopScore,
    minMargin: SCORE_THRESHOLDS.minMargin,
    decisionIntent: ruleDecision ?? thresholdDecision,
  };
}

export function detectScoredIntent(query: string): QueryIntent {
  return scoreIntentQuery(query).decisionIntent;
}

// Backward-compatible export used by some local tests/docs.
export function scoreIntentFeatures(features: IntentFeatures) {
  return scoreIntentQuery(features.query);
}
