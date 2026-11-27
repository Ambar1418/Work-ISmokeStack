import { NextResponse } from "next/server";
import { DIAGNOSTIC_PROMPTS } from "@/data/soniaData";
import {
  insertDiagnosticRecord,
  insertEngagementEvent,
} from "@/lib/db";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  hashClientIp,
} from "@/lib/rateLimit";

export async function POST(req: Request) {
  const ipHash = hashClientIp(getClientIpFromHeaders(req.headers)) || "unknown";
  const limit = checkRateLimit(`diag:${ipHash}`, 20, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "Too many diagnostic submissions. Please wait." },
      { status: 429 }
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
  const promptId = typeof rec.promptId === "string" ? rec.promptId.trim() : "";
  const sessionId =
    typeof rec.sessionId === "string" && rec.sessionId.trim().length <= 64
      ? rec.sessionId.trim()
      : "anon-diag";
  const selectedAnswers = Array.isArray(rec.selectedAnswers)
    ? rec.selectedAnswers
        .filter((a): a is string => typeof a === "string")
        .slice(0, 6)
    : [];
  const businessDescription =
    typeof rec.businessDescription === "string"
      ? rec.businessDescription.trim().slice(0, 600)
      : null;

  const option =
    DIAGNOSTIC_PROMPTS.find((d) => d.id === promptId) ?? DIAGNOSTIC_PROMPTS[0];

  const aiAnalysis = `Diagnostic focus: ${option.challengeCategory}. Mapped to Sonia's ${option.branchId} branch (${option.relevantExpertise.join(", ")}).`;

  try {
    const saved = await insertDiagnosticRecord({
      sessionId,
      challengeCategory: option.challengeCategory,
      selectedAnswers,
      businessDescription,
      aiAnalysis,
      recommendedActions: option.recommendedActions,
      recommendedBranches: [option.branchId],
      relevantExpertise: option.relevantExpertise,
    });

    await insertEngagementEvent({
      eventType: "diagnostic_completed",
      sessionId,
      targetId: option.branchId,
      targetLabel: option.challengeCategory,
    }).catch(() => undefined);

    return NextResponse.json({ ok: true, diagnostic: saved }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Unable to record diagnostic." },
      { status: 500 }
    );
  }
}

