import { NextRequest, NextResponse } from "next/server";
import {
  getAdminSecret,
  isAuthorizedAnalyticsRequest,
} from "@/lib/analyticsAuth";
import { getStrategyIntelligence, type DateRangeFilter } from "@/lib/db";

const VALID_RANGES = new Set<DateRangeFilter>(["today", "7d", "30d", "all"]);

export async function GET(req: NextRequest) {
  if (!getAdminSecret()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Analytics access is disabled until ADMIN_ANALYTICS_SECRET is configured on the server.",
      },
      { status: 503 }
    );
  }

  if (!isAuthorizedAnalyticsRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized. Valid admin credentials required." },
      { status: 401 }
    );
  }

  const rawRange = req.nextUrl.searchParams.get("range") || "all";
  const range: DateRangeFilter = VALID_RANGES.has(rawRange as DateRangeFilter)
    ? (rawRange as DateRangeFilter)
    : "all";

  try {
    const data = await getStrategyIntelligence(range);
    return NextResponse.json(
      { ok: true, analytics: data },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const isConfigErr =
      err instanceof Error && err.message.includes("Database not configured");
    return NextResponse.json(
      {
        ok: false,
        error: isConfigErr
          ? "Database not configured. Set DATABASE_URL in your deployment environment."
          : "Failed to load strategy intelligence metrics.",
      },
      { status: isConfigErr ? 503 : 500 }
    );
  }
}
