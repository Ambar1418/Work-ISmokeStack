import type {
  CmsBranchRecord,
  CmsKnowledgeRecord,
  CmsMilestoneRecord,
  StrategyIntelligencePayload,
} from "./db";
import type { StrategyBranch } from "@/data/soniaData";

export interface StructuredAiStrategyResponse {
  answer: string;
  recommendedBranchId: StrategyBranch["id"];
  relevantMilestoneIds: string[];
  supportingEvidence: string[];
  suggestedNextQuestion: string;
  challengeCategory: string;
  unanswered?: boolean;
  mode: "groq" | "deterministic_fallback";
  modelUsed: string;
}

const VALID_BRANCH_IDS = new Set<StrategyBranch["id"]>([
  "brand",
  "revenue",
  "marketing",
  "operations",
  "product",
  "people",
]);

export function getGroqApiKey(): string | null {
  const key = process.env.GROQ_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function getGroqModel(): string {
  return process.env.GROQ_MODEL?.trim() || "openai/gpt-oss-120b";
}

export function retrieveRelevantContext(params: {
  question: string;
  branches: CmsBranchRecord[];
  milestones: CmsMilestoneRecord[];
  knowledge: CmsKnowledgeRecord[];
}) {
  const tokens = params.question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length >= 3);

  const scoreText = (text: string) => {
    const lower = text.toLowerCase();
    let score = 0;
    for (const t of tokens) {
      if (lower.includes(t)) score += 1;
    }
    return score;
  };

  const scoredKnowledge = params.knowledge
    .map((k) => ({
      entry: k,
      score: scoreText(`${k.title} ${k.content} ${k.category} ${k.branchId ?? ""}`),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  const scoredMilestones = params.milestones
    .map((m) => ({
      milestone: m,
      score: scoreText(
        `${m.company} ${m.chapterLabel} ${m.roles.map((r) => r.title).join(" ")} ${m.highlights.join(" ")} ${m.fruitOutcome ?? ""} ${m.branchIds.join(" ")}`
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    knowledge: scoredKnowledge.map((x) => x.entry),
    milestones: scoredMilestones.map((x) => x.milestone),
    branches: params.branches,
  };
}

export function deterministicBranchRecommendation(text: string): {
  branchId: StrategyBranch["id"];
  challengeCategory: string;
} {
  const q = text.toLowerCase();
  if (
    q.includes("lead") ||
    q.includes("pipeline") ||
    q.includes("deal") ||
    q.includes("revenue") ||
    q.includes("conversion") ||
    q.includes("crm")
  ) {
    return {
      branchId: "revenue",
      challengeCategory: "Lead Generation & Pipeline",
    };
  }
  if (
    q.includes("operation") ||
    q.includes("marketo") ||
    q.includes("automation") ||
    q.includes("process") ||
    q.includes("structure") ||
    q.includes("data")
  ) {
    return {
      branchId: "operations",
      challengeCategory: "Marketing Operations & Structure",
    };
  }
  if (
    q.includes("sales") ||
    q.includes("team") ||
    q.includes("align") ||
    q.includes("hire") ||
    q.includes("leadership") ||
    q.includes("people")
  ) {
    return {
      branchId: "people",
      challengeCategory: "Sales & Marketing Alignment",
    };
  }
  if (
    q.includes("product") ||
    q.includes("launch") ||
    q.includes("swot") ||
    q.includes("feature")
  ) {
    return {
      branchId: "product",
      challengeCategory: "Product Marketing & Launches",
    };
  }
  if (
    q.includes("brand") ||
    q.includes("position") ||
    q.includes("messag") ||
    q.includes("narrative") ||
    q.includes("uae")
  ) {
    return {
      branchId: "brand",
      challengeCategory: "Product & Brand Positioning",
    };
  }
  return {
    branchId: "marketing",
    challengeCategory: "Marketing Strategy & Growth",
  };
}

export function buildDeterministicGroundedGuide(params: {
  question: string;
  branches: CmsBranchRecord[];
  milestones: CmsMilestoneRecord[];
  knowledge: CmsKnowledgeRecord[];
}): StructuredAiStrategyResponse {
  const { branchId, challengeCategory } = deterministicBranchRecommendation(
    params.question
  );
  const branch =
    params.branches.find((b) => b.id === branchId) ?? params.branches[0];
  const matchedMilestones = params.milestones
    .filter((m) => m.branchIds.includes(branchId))
    .slice(0, 3);
  const evidence = matchedMilestones
    .map(
      (m) =>
        m.fruitOutcome ||
        `${m.company} (${m.overallSpan}): ${m.highlights[0] ?? ""}`
    )
    .filter(Boolean);

  return {
    answer: `As an AI guide to Sonia's verified profile: for ${challengeCategory.toLowerCase()}, her ${branch.label} branch (${branch.essence}) connects directly. ${branch.description}`,
    recommendedBranchId: branch.id,
    relevantMilestoneIds: matchedMilestones.map((m) => m.id),
    supportingEvidence: evidence,
    suggestedNextQuestion: `How did Sonia apply ${branch.label.toLowerCase()} frameworks at ${matchedMilestones[0]?.company ?? "her leadership roles"}?`,
    challengeCategory,
    mode: "deterministic_fallback",
    modelUsed: "verified-profile-retriever",
  };
}

async function callGroqJson<T>(params: {
  systemPrompt: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
}): Promise<{ data: T; model: string }> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error("GROQ_API_KEY_MISSING");
  }

  const preferred = getGroqModel();
  const candidates = Array.from(
    new Set([preferred, "openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.8-27b"])
  );

  let lastError = "GROQ_FAILED";
  for (const model of candidates) {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: params.temperature ?? 0.25,
        max_tokens: params.maxTokens ?? 700,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: params.systemPrompt },
          ...params.messages,
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      lastError = `GROQ_HTTP_${res.status}: ${errText.slice(0, 200)}`;
      if (res.status === 404 || res.status === 400) {
        continue;
      }
      throw new Error(lastError);
    }

    const payload = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const raw = payload.choices?.[0]?.message?.content?.trim() ?? "";
    if (!raw) {
      lastError = "GROQ_EMPTY_RESPONSE";
      continue;
    }

    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```$/i, "")
      .trim();
    return { data: JSON.parse(cleaned) as T, model };
  }

  throw new Error(lastError);
}

export async function askStrategyTreeWithGroq(params: {
  question: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  branches: CmsBranchRecord[];
  milestones: CmsMilestoneRecord[];
  knowledge: CmsKnowledgeRecord[];
}): Promise<StructuredAiStrategyResponse> {
  const context = retrieveRelevantContext(params);

  const systemPrompt = `You are an AI guide to Sonia Specialist's verified professional experience ("Ask Sonia's Strategy Tree").
STRICT RULES:
1. Identify yourself clearly as an AI guide to Sonia's professional experience — NEVER claim to be Sonia herself.
2. Answer ONLY using the verified facts supplied in the CONTEXT below. NEVER invent achievements, statistics, client names, or dates.
3. If the visitor asks something outside Sonia's verified background, clearly state that the verified profile does not contain that information, set "unanswered": true, and guide them back to documented facts.
4. Return ONLY valid JSON with these exact keys:
{
  "answer": "Concise 2-4 sentence grounded explanation distinguishing verified profile facts from general recommendations.",
  "recommendedBranchId": "brand" | "revenue" | "marketing" | "operations" | "product" | "people",
  "relevantMilestoneIds": ["milestone-id-1", "milestone-id-2"],
  "supportingEvidence": ["Exact factual bullet 1", "Exact factual bullet 2"],
  "suggestedNextQuestion": "One thoughtful follow-up question",
  "challengeCategory": "Short business challenge label",
  "unanswered": false
}

CONTEXT — BRANCHES:
${context.branches.map((b) => `- ${b.id} (${b.label}): ${b.essence}. ${b.description}`).join("\n")}

CONTEXT — VERIFIED CAREER MILESTONES (use these exact IDs in relevantMilestoneIds):
${context.milestones
  .map(
    (m) =>
      `- id="${m.id}" | ${m.company} (${m.overallSpan}) | Roles: ${m.roles.map((r) => `${r.title} (${r.period})`).join("; ")} | Highlights: ${m.highlights.join(" ")}`
  )
  .join("\n")}

CONTEXT — KNOWLEDGE BASE:
${context.knowledge.map((k) => `- [${k.category}] ${k.title}: ${k.content}`).join("\n")}`;

  const { data: parsed, model } = await callGroqJson<
    Partial<StructuredAiStrategyResponse>
  >({
    systemPrompt,
    messages: [
      ...params.history.slice(-4),
      { role: "user", content: params.question },
    ],
    temperature: 0.25,
    maxTokens: 600,
  });

  const validMilestoneIds = new Set(params.milestones.map((m) => m.id));
  const branchId: StrategyBranch["id"] =
    parsed.recommendedBranchId &&
    VALID_BRANCH_IDS.has(parsed.recommendedBranchId)
      ? parsed.recommendedBranchId
      : deterministicBranchRecommendation(params.question).branchId;

  const relevantMilestoneIds = Array.isArray(parsed.relevantMilestoneIds)
    ? parsed.relevantMilestoneIds.filter((id) => validMilestoneIds.has(id))
    : [];

  return {
    answer:
      typeof parsed.answer === "string" && parsed.answer.trim().length > 0
        ? parsed.answer.trim()
        : buildDeterministicGroundedGuide(params).answer,
    recommendedBranchId: branchId,
    relevantMilestoneIds:
      relevantMilestoneIds.length > 0
        ? relevantMilestoneIds.slice(0, 3)
        : params.milestones
            .filter((m) => m.branchIds.includes(branchId))
            .slice(0, 2)
            .map((m) => m.id),
    supportingEvidence: Array.isArray(parsed.supportingEvidence)
      ? parsed.supportingEvidence
          .filter((s): s is string => typeof s === "string")
          .slice(0, 3)
      : [],
    suggestedNextQuestion:
      typeof parsed.suggestedNextQuestion === "string" &&
      parsed.suggestedNextQuestion.trim().length > 0
        ? parsed.suggestedNextQuestion.trim()
        : "Which career milestone demonstrates this expertise in practice?",
    challengeCategory:
      typeof parsed.challengeCategory === "string" &&
      parsed.challengeCategory.trim().length > 0
        ? parsed.challengeCategory.trim()
        : deterministicBranchRecommendation(params.question).challengeCategory,
    unanswered: Boolean(parsed.unanswered),
    mode: "groq",
    modelUsed: model,
  };
}

export async function classifyEnquiryWithAiOrRules(input: {
  businessChallenge: string;
  subject: string;
  message: string;
}): Promise<{ classification: string; branchId: StrategyBranch["id"] }> {
  const combined = `${input.businessChallenge} ${input.subject} ${input.message}`;
  const fallback = deterministicBranchRecommendation(combined);
  if (!getGroqApiKey()) {
    return {
      classification: fallback.challengeCategory,
      branchId: fallback.branchId,
    };
  }

  try {
    const { data: parsed } = await callGroqJson<{
      classification?: string;
      branchId?: StrategyBranch["id"];
    }>({
      systemPrompt:
        'Classify the business inquiry into JSON {"classification": string, "branchId": "brand"|"revenue"|"marketing"|"operations"|"product"|"people"}.',
      messages: [
        {
          role: "user",
          content: `Challenge: ${input.businessChallenge}\nSubject: ${input.subject}\nMessage: ${input.message.slice(0, 400)}`,
        },
      ],
      temperature: 0.1,
      maxTokens: 120,
    });

    return {
      classification:
        parsed.classification?.trim() || fallback.challengeCategory,
      branchId:
        parsed.branchId && VALID_BRANCH_IDS.has(parsed.branchId)
          ? parsed.branchId
          : fallback.branchId,
    };
  } catch {
    return {
      classification: fallback.challengeCategory,
      branchId: fallback.branchId,
    };
  }
}

export async function generateExecutiveInsights(
  analytics: StrategyIntelligencePayload
): Promise<{
  sufficientData: boolean;
  mode: "groq" | "data_summary";
  insights: string[];
  disclaimer: string;
}> {
  const totalSignals =
    analytics.overview.totalVisitors +
    analytics.overview.aiAssistantUsage +
    analytics.overview.diagnosticCompletions +
    analytics.overview.totalEnquiries;

  if (totalSignals < 2) {
    return {
      sufficientData: false,
      mode: "data_summary",
      insights: [
        "Insufficient real visitor activity recorded so far to generate behavioral patterns. As visitors explore branches, run diagnostics, ask the AI guide, and submit enquiries, data-backed executive insights will appear here automatically.",
      ],
      disclaimer:
        "No synthetic or dummy projections are generated when real visitor records are insufficient.",
    };
  }

  const topBranch = [...analytics.treeHeatmap.branches].sort(
    (a, b) => b.clicks - a.clicks
  )[0];
  const topChallenge = analytics.charts.challengeDistribution[0];
  const topLeaf = analytics.treeHeatmap.leaves[0];

  const deterministicSummary = [
    topBranch && topBranch.clicks > 0
      ? `The ${topBranch.label} branch currently leads tree exploration (${topBranch.clicks} clicks across ${topBranch.uniqueSessions} sessions).`
      : "No branch click concentration has emerged yet.",
    topChallenge
      ? `${topChallenge.label} is the most frequently selected business challenge (${topChallenge.count} occurrences).`
      : "No dominant business challenge category yet.",
    topLeaf
      ? `${topLeaf.label} is the most frequently opened career milestone (${topLeaf.count} views).`
      : "Milestone views are evenly distributed or still accumulating.",
  ];

  if (!getGroqApiKey()) {
    return {
      sufficientData: true,
      mode: "data_summary",
      insights: deterministicSummary,
      disclaimer:
        "AI Interpretation (rule-based summary from real database metrics; configure GROQ_API_KEY for narrative Groq synthesis).",
    };
  }

  try {
    const safeAggregate = {
      overview: analytics.overview,
      challenges: analytics.charts.challengeDistribution.slice(0, 6),
      branches: analytics.treeHeatmap.branches.map((b) => ({
        label: b.label,
        clicks: b.clicks,
        uniqueSessions: b.uniqueSessions,
        aiRecommendations: b.aiRecommendations,
        contactConversions: b.contactConversions,
      })),
      topMilestones: analytics.treeHeatmap.leaves.slice(0, 5),
    };

    const { data: parsed } = await callGroqJson<{ insights?: string[] }>({
      systemPrompt:
        'Analyze these aggregated, non-personal analytics from Sonia Specialist\'s Living Strategy Tree and return JSON {"insights": ["insight 1", "insight 2", "insight 3"]} strictly based on the numbers without inventing figures.',
      messages: [
        { role: "user", content: JSON.stringify(safeAggregate) },
      ],
      temperature: 0.2,
      maxTokens: 350,
    });

    return {
      sufficientData: true,
      mode: "groq",
      insights:
        Array.isArray(parsed.insights) && parsed.insights.length > 0
          ? parsed.insights.slice(0, 4)
          : deterministicSummary,
      disclaimer:
        "AI-generated interpretation based strictly on aggregated database records (not verified business claims).",
    };
  } catch {
    return {
      sufficientData: true,
      mode: "data_summary",
      insights: deterministicSummary,
      disclaimer:
        "AI Interpretation (generated from aggregated database records).",
    };
  }
}

