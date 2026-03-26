export type QueryIntent = "WHY" | "WHEN" | "ENTITY" | "GENERAL";

const WHY_PATTERNS: RegExp[] = [
  /\bwhy\b/i,
  /\breason\b/i,
  /\bcause\b/i,
  /\bbecause\b/i,
  /\broot\s+cause\b/i,
  /\bhow\s+come\b/i,
  /为什么/,
  /为何/,
  /为啥/,
  /原因/,
  /起因/,
  /根因/,
  /怎么会/,
  /导致/,
  /造成/,
  /因果/,
];

const STRONG_WHEN_PATTERNS: RegExp[] = [
  /\bwhen\b/i,
  /\bbefore\b/i,
  /\bafter\b/i,
  /\bduring\b/i,
  /\byesterday\b/i,
  /\btoday\b/i,
  /\btomorrow\b/i,
  /\brecent(?:ly)?\b/i,
  /\blast\s+(?:night|week|month|year)\b/i,
  /\bthis\s+(?:morning|afternoon|evening|week|month|year)\b/i,
  /什么时候/,
  /何时/,
  /几点/,
  /哪天/,
  /多久/,
  /先后/,
  /之前/,
  /之后/,
  /期间/,
  /昨天/,
  /今天/,
  /明天/,
  /最近/,
  /近期/,
  /上周/,
  /上个月/,
  /去年/,
  /今年/,
];

const WHEN_TOPIC_PATTERNS: RegExp[] = [/\btime\b/i, /\bdate\b/i, /\btimeline\b/i, /时间/, /日期/, /时间线/];

const WHEN_EVENT_HINT_PATTERNS: RegExp[] = [
  /\bchange(?:d|s)?\b/i,
  /\bhappen(?:ed|s|ing)?\b/i,
  /\bstart(?:ed|s|ing)?\b/i,
  /\bend(?:ed|s|ing)?\b/i,
  /\bfinish(?:ed|es|ing)?\b/i,
  /\brelease(?:d|s)?\b/i,
  /\bdeploy(?:ed|ment|s)?\b/i,
  /\bincident\b/i,
  /\bissue\b/i,
  /\boutage\b/i,
  /\btask\b/i,
  /\bupdate\b/i,
  /\bmeeting\b/i,
  /\bversion\b/i,
  /\bdeadline\b/i,
  /发生/,
  /开始/,
  /结束/,
  /完成/,
  /发布/,
  /上线/,
  /故障/,
  /问题/,
  /任务/,
  /更新/,
  /会议/,
  /版本/,
  /截止/,
  /变更/,
  /出现/,
  /改了/,
];

const STRONG_ENTITY_PATTERNS: RegExp[] = [/\bwho\b/i, /\bwhere\b/i, /谁/, /哪位/, /哪里/, /哪儿/];

const ENTITY_NOUN_PATTERNS: RegExp[] = [
  /\bperson\b/i,
  /\bpeople\b/i,
  /\bteam\b/i,
  /\bproject\b/i,
  /\bfile\b/i,
  /\bdoc(?:ument)?\b/i,
  /\bentity\b/i,
  /\bmember\b/i,
  /\bowner\b/i,
  /\bmaintainer\b/i,
  /\brepo(?:sitory)?\b/i,
  /\bservice\b/i,
  /\bmodule\b/i,
  /\bcomponent\b/i,
  /\bname\b/i,
  /\blocation\b/i,
  /人员/,
  /成员/,
  /组织/,
  /团队/,
  /项目/,
  /文件/,
  /文档/,
  /实体/,
  /负责人/,
  /仓库/,
  /服务/,
  /模块/,
  /组件/,
  /名称/,
  /名字/,
  /地点/,
  /位置/,
];

const ENTITY_HINT_PATTERNS: RegExp[] = [
  /\bcalled\b/i,
  /\bowner\b/i,
  /\bowns?\b/i,
  /\bmaintainer\b/i,
  /\bresponsible\b/i,
  /\bbelong(?:s)?\b/i,
  /\blocation\b/i,
  /\baddress\b/i,
  /\bid\b/i,
  /\blist\b/i,
  /\bshow\b/i,
  /叫.?什么/,
  /名称/,
  /名字/,
  /负责人/,
  /归属/,
  /位于/,
  /地址/,
  /编号/,
  /列出/,
  /清单/,
  /有哪些/,
  /是谁/,
  /负责/,
];

const AMBIGUOUS_QUESTION_PATTERNS: RegExp[] = [/\bwhat\b/i, /\bwhich\b/i, /什么/, /哪个/, /哪些/];

const GENERAL_WEAK_QUERY_PATTERNS: RegExp[] = [
  /^\s*(?:what|which)\s+is\s+(?:this|that|it)\s*[?.!]?\s*$/i,
  /^\s*(?:what|which)\s+(?:one\s+)?is\s+better\s*[?.!]?\s*$/i,
  /^\s*这是什么\s*[？?]?\s*$/,
  /^\s*哪个更好\s*[？?]?\s*$/,
];

const SUMMARY_REQUEST_PATTERNS: RegExp[] = [
  /\bsummar(?:y|ize)\b/i,
  /\brecap\b/i,
  /\boverview\b/i,
  /\bbrief\b/i,
  /总结/,
  /概述/,
  /摘要/,
  /复盘/,
];

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(text));
}

function isWeakGeneralQuery(text: string): boolean {
  return matchesAny(text, GENERAL_WEAK_QUERY_PATTERNS);
}

function isSummaryRequest(text: string): boolean {
  return matchesAny(text, SUMMARY_REQUEST_PATTERNS);
}

function isWhenIntent(text: string): boolean {
  if (matchesAny(text, STRONG_WHEN_PATTERNS)) return true;

  const hasWhenTopic = matchesAny(text, WHEN_TOPIC_PATTERNS);
  if (!hasWhenTopic) return false;

  const hasAmbiguousQuestion = matchesAny(text, AMBIGUOUS_QUESTION_PATTERNS);
  if (hasAmbiguousQuestion) return matchesAny(text, WHEN_EVENT_HINT_PATTERNS);

  if (isWeakGeneralQuery(text)) return false;
  return true;
}

function isEntityIntent(text: string): boolean {
  if (matchesAny(text, STRONG_ENTITY_PATTERNS)) return true;

  const hasEntityNoun = matchesAny(text, ENTITY_NOUN_PATTERNS);
  const hasEntityHint = matchesAny(text, ENTITY_HINT_PATTERNS);

  if (isWeakGeneralQuery(text) && !hasEntityNoun && !hasEntityHint) return false;
  return hasEntityNoun || hasEntityHint;
}

export function detectQueryIntent(query: string): QueryIntent {
  if (typeof query !== "string") return "GENERAL";

  const normalized = query.trim();
  if (!normalized) return "GENERAL";

  if (matchesAny(normalized, WHY_PATTERNS)) return "WHY";
  if (isSummaryRequest(normalized)) return "GENERAL";
  if (isWhenIntent(normalized)) return "WHEN";
  if (isEntityIntent(normalized)) return "ENTITY";
  return "GENERAL";
}

export function detectQueryIntentDetailed(query: string) {
  const intent = detectQueryIntent(query);
  return { intent };
}
