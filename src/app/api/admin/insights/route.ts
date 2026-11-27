import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAnalyticsRequest } from "@/lib/analyticsAuth";
import { getStrategyIntelligence } from "@/lib/db";
import { generateExecutiveInsights } from "@/lib/ai";

export async function POST(req: NextRequest) {
  if (!isAuthorizedAnalyticsRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const analytics = await getStrategyIntelligence("all");
    const result = await generateExecutiveInsights(analytics);
    return NextResponse.json({ ok: true, ...result }, { status: 200 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to generate insights." },
      { status: 500 }
    );
  }
}

