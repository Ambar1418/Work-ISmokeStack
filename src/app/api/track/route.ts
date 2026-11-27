import { NextResponse } from "next/server";
import { insertEngagementEvent, type EngagementEventType } from "@/lib/db";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  hashClientIp,
} from "@/lib/rateLimit";
import { ALLOWED_EVENT_TYPES, sanitizeMetadata } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const rawIp = getClientIpFromHeaders(req.headers);
    const ipHash = hashClientIp(rawIp) || "unknown";

    const limit = checkRateLimit(`track:${ipHash}`, 120, 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { ok: false, error: "Rate limit exceeded." },
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { ok: false, error: "Invalid payload." },
        { status: 400 }
      );
    }

    const record = body as Record<string, unknown>;
    const eventType =
      typeof record.eventType === "string" ? record.eventType.trim() : "";
    const sessionId =
      typeof record.sessionId === "string" ? record.sessionId.trim() : "";

    if (!ALLOWED_EVENT_TYPES.has(eventType as EngagementEventType)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported eventType." },
        { status: 400 }
      );
    }

    if (!sessionId || sessionId.length > 64) {
      return NextResponse.json(
        { ok: false, error: "Valid anonymous sessionId is required." },
        { status: 400 }
      );
    }

    const targetId =
      typeof record.targetId === "string"
        ? record.targetId.trim().slice(0, 120)
        : null;
    const targetLabel =
      typeof record.targetLabel === "string"
        ? record.targetLabel.trim().slice(0, 180)
        : null;
    const metadata = sanitizeMetadata(record.metadata);

    const saved = await insertEngagementEvent({
      eventType: eventType as EngagementEventType,
      sessionId,
      targetId,
      targetLabel,
      metadata,
    });

    return NextResponse.json(
      { ok: true, id: saved.id, createdAt: saved.createdAt },
      { status: 201 }
    );
  } catch (err) {
    const isConfigErr =
      err instanceof Error && err.message.includes("Database not configured");
    return NextResponse.json(
      {
        ok: false,
        error: isConfigErr
          ? "Analytics database not configured."
          : "Failed to record engagement event.",
      },
      { status: isConfigErr ? 503 : 500 }
    );
  }
}

