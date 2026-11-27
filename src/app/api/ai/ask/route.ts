import { NextResponse } from "next/server";
import {
  getPublishedPortfolioData,
  insertAiInteraction,
  insertEngagementEvent,
} from "@/lib/db";
import {
  askStrategyTreeWithGroq,
  buildDeterministicGroundedGuide,
} from "@/lib/ai";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  hashClientIp,
} from "@/lib/rateLimit";

export async function POST(req: Request) {
  const rawIp = getClientIpFromHeaders(req.headers);
  const ipHash = hashClientIp(rawIp) || "unknown";

  const limit = checkRateLimit(`ai:${ipHash}`, 12, 5 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        error: `Too many questions in a short window. Please wait ${limit.retryAfterSeconds}s and retry.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const rec = (body ?? {}) as Record<string, unknown>;
  const question =
    typeof rec.question === "string" ? rec.question.trim() : "";
  const sessionId =
    typeof rec.sessionId === "string" && rec.sessionId.trim().length <= 64
      ? rec.sessionId.trim()
      : "anon-ai";
  const history = Array.isArray(rec.history)
    ? rec.history
        .filter(
          (item): item is { role: "user" | "assistant"; content: string } =>
            Boolean(
              item &&
                typeof item === "object" &&
                ((item as { role?: unknown }).role === "user" ||
                  (item as { role?: unknown }).role === "assistant") &&
                typeof (item as { content?: unknown }).content === "string"
            )
        )
        .slice(-8)
    : [];

  if (question.length < 3 || question.length > 600) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please ask a clear question (3–600 characters).",
      },
      { status: 400 }
    );
  }

  const portfolio = await getPublishedPortfolioData();
  if (!portfolio.settings.aiAssistantEnabled) {
    return NextResponse.json(
      {
        ok: false,
        code: "AI_DISABLED",
        error: "The AI Strategy Assistant is currently paused by the administrator.",
      },
      { status: 503 }
    );
  }

  if (history.length >= portfolio.settings.maxConversationTurns * 2) {
    return NextResponse.json(
      {
        ok: false,
        code: "TURN_LIMIT",
        error:
          "Conversation length limit reached for this session. Start a fresh thread or send Sonia a direct brief.",
      },
      { status: 400 }
    );
  }

  await insertEngagementEvent({
    eventType: "ai_question_submitted",
    sessionId,
    targetId: "ai-assistant",
    targetLabel: question.slice(0, 80),
  }).catch(() => undefined);

  try {
    const response = await askStrategyTreeWithGroq({
      question,
      history,
      branches: portfolio.branches,
      milestones: portfolio.milestones,
      knowledge: portfolio.knowledge,
    });

    await insertAiInteraction({
      sessionId,
      question,
      challengeCategory: response.challengeCategory,
      answerSummary: response.answer,
      recommendedBranch: response.recommendedBranchId,
      milestonesReturned: response.relevantMilestoneIds,
      modelUsed: response.modelUsed,
      status: response.unanswered ? "unanswered" : "ok",
    }).catch(() => undefined);

    await insertEngagementEvent({
      eventType: "ai_recommended_branch",
      sessionId,
      targetId: response.recommendedBranchId,
      targetLabel: response.recommendedBranchId,
    }).catch(() => undefined);

    return NextResponse.json({ ok: true, data: response }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown AI error";
    const isKeyMissing = message === "GROQ_API_KEY_MISSING";
    const fallback = buildDeterministicGroundedGuide({
      question,
      branches: portfolio.branches,
      milestones: portfolio.milestones,
      knowledge: portfolio.knowledge,
    });

    await insertAiInteraction({
      sessionId,
      question,
      challengeCategory: fallback.challengeCategory,
      answerSummary: isKeyMissing
        ? "GROQ_API_KEY not configured; returned deterministic profile match."
        : "Groq API failure; returned deterministic profile match.",
      recommendedBranch: fallback.recommendedBranchId,
      milestonesReturned: fallback.relevantMilestoneIds,
      modelUsed: isKeyMissing ? "unconfigured" : "error-fallback",
      status: "error",
      errorMessage: message.slice(0, 240),
    }).catch(() => undefined);

    return NextResponse.json(
      {
        ok: false,
        code: isKeyMissing ? "AI_KEY_MISSING" : "AI_API_ERROR",
        error: isKeyMissing
          ? "GROQ_API_KEY is not configured on the server yet. Showing a deterministic verified profile match instead."
          : "Live Groq AI request failed temporarily. Showing a verified profile match — you can retry anytime.",
        fallback,
      },
      { status: isKeyMissing ? 503 : 502 }
    );
  }
}
