import { NextResponse } from "next/server";
import { getPublishedPortfolioData } from "@/lib/db";

export async function GET() {
  try {
    const data = await getPublishedPortfolioData();
    return NextResponse.json(
      {
        ok: true,
        branches: data.branches,
        milestones: data.milestones,
        settings: data.settings,
      },
      { status: 200, headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to load portfolio data." },
      { status: 500 }
    );
  }
}

