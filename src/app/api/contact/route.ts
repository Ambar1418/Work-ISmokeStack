import { NextResponse } from "next/server";
import {
  hasRecentDuplicateEnquiry,
  insertEngagementEvent,
  insertEnquiry,
} from "@/lib/db";
import { classifyEnquiryWithAiOrRules } from "@/lib/ai";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  hashClientIp,
} from "@/lib/rateLimit";
import { validateContactPayload } from "@/lib/validation";

export async function POST(req: Request) {
  try {
    const rawIp = getClientIpFromHeaders(req.headers);
    const ipHash = hashClientIp(rawIp) || "unknown";

    const limit = checkRateLimit(`contact:${ipHash}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many enquiries sent recently. Please wait ${limit.retryAfterSeconds}s and try again.`,
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
        { ok: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const validation = validateContactPayload(body);
    if (!validation.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: validation.error,
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      company,
      businessChallenge,
      subject,
      message,
      honeypot,
      sessionId,
    } = validation.data;

    // Silent honeypot protection
    if (honeypot.length > 0) {
      return NextResponse.json(
        {
          ok: true,
          message: "Thank you for reaching out. Sonia will respond thoughtfully.",
        },
        { status: 200 }
      );
    }

    const isDuplicate = await hasRecentDuplicateEnquiry(email, subject, message);
    if (isDuplicate) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "A matching enquiry was already received recently. No need to send twice.",
        },
        { status: 409 }
      );
    }

    // Never reject or discard genuine enquiries even if AI classification fails
    const { classification, branchId } = await classifyEnquiryWithAiOrRules({
      businessChallenge,
      subject,
      message,
    });

    const saved = await insertEnquiry({
      name,
      email,
      company,
      businessChallenge,
      subject,
      message,
      aiClassification: classification,
      relevantBranch: branchId,
      sessionId,
      ipHash,
    });

    if (sessionId) {
      await insertEngagementEvent({
        eventType: "contact_submitted",
        sessionId,
        targetId: branchId,
        targetLabel: classification,
        metadata: { enquiryId: saved.id },
      }).catch(() => undefined);
    }

    return NextResponse.json(
      {
        ok: true,
        id: saved.id,
        classification,
        relevantBranch: branchId,
        createdAt: saved.createdAt,
        message: "Your enquiry has been received. Thank you for connecting.",
      },
      { status: 201 }
    );
  } catch (err) {
    const isConfigErr =
      err instanceof Error && err.message.includes("Database not configured");
    return NextResponse.json(
      {
        ok: false,
        error: isConfigErr
          ? "Enquiry database is not configured on this server yet."
          : "Unable to save your enquiry right now. Please connect on LinkedIn.",
      },
      { status: isConfigErr ? 503 : 500 }
    );
  }
}
