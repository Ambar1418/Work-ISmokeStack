import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAnalyticsRequest } from "@/lib/analyticsAuth";
import { updateEnquiryAdmin, type EnquiryStatus } from "@/lib/db";
import { ALLOWED_ENQUIRY_STATUSES } from "@/lib/validation";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isAuthorizedAnalyticsRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid enquiry ID." },
      { status: 400 }
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
  const status =
    typeof rec.status === "string" &&
    ALLOWED_ENQUIRY_STATUSES.has(rec.status as EnquiryStatus)
      ? (rec.status as EnquiryStatus)
      : undefined;
  const internalNotes =
    typeof rec.internalNotes === "string"
      ? rec.internalNotes.slice(0, 2000)
      : undefined;

  const updated = await updateEnquiryAdmin(numericId, {
    status,
    internalNotes,
  });

  if (!updated) {
    return NextResponse.json(
      { ok: false, error: "Enquiry not found." },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, enquiry: updated }, { status: 200 });
}

