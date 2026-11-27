import type { EngagementEventType, EnquiryStatus } from "./db";

export interface ValidatedContactPayload {
  name: string;
  email: string;
  company: string | null;
  businessChallenge: string;
  subject: string;
  message: string;
  honeypot: string;
  sessionId: string | null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const ALLOWED_EVENT_TYPES = new Set<EngagementEventType>([
  "page_view",
  "branch_selected",
  "root_selected",
  "trunk_selected",
  "milestone_opened",
  "case_study_opened",
  "seed_opened",
  "ai_opened",
  "ai_question_submitted",
  "ai_recommended_branch",
  "diagnostic_started",
  "diagnostic_completed",
  "linkedin_clicked",
  "contact_clicked",
  "contact_submitted",
]);

export const ALLOWED_ENQUIRY_STATUSES = new Set<EnquiryStatus>([
  "New",
  "Contacted",
  "Qualified",
  "In Progress",
  "Closed",
]);

export function validateContactPayload(
  raw: unknown
):
  | { ok: true; data: ValidatedContactPayload }
  | { ok: false; error: string; fieldErrors: Record<string, string> } {
  if (!raw || typeof raw !== "object") {
    return {
      ok: false,
      error: "Invalid request payload.",
      fieldErrors: {},
    };
  }

  const body = raw as Record<string, unknown>;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const company =
    typeof body.company === "string" && body.company.trim().length > 0
      ? body.company.trim().slice(0, 160)
      : null;
  const businessChallenge =
    typeof body.businessChallenge === "string"
      ? body.businessChallenge.trim()
      : typeof body.subject === "string"
        ? body.subject.trim()
        : "";
  const subject =
    typeof body.subject === "string" && body.subject.trim().length > 0
      ? body.subject.trim().slice(0, 180)
      : businessChallenge.slice(0, 180);
  const message =
    typeof body.message === "string" ? body.message.trim() : "";
  const honeypot =
    typeof body.website === "string" ? body.website.trim() : "";
  const sessionId =
    typeof body.sessionId === "string" && body.sessionId.trim().length <= 64
      ? body.sessionId.trim()
      : null;

  const fieldErrors: Record<string, string> = {};

  if (name.length < 2 || name.length > 120) {
    fieldErrors.name = "Please enter your name (2–120 characters).";
  }
  if (!EMAIL_REGEX.test(email) || email.length > 254) {
    fieldErrors.email = "Please enter a valid email address.";
  }
  if (businessChallenge.length < 3 || businessChallenge.length > 180) {
    fieldErrors.businessChallenge =
      "Please share or select your business challenge (3–180 characters).";
  }
  if (message.length > 3000) {
    fieldErrors.message = "Message must be under 3000 characters.";
  }

  const finalMessage =
    message.length > 0 ? message : `Business challenge: ${businessChallenge}`;

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors,
    };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      company,
      businessChallenge,
      subject,
      message: finalMessage,
      honeypot,
      sessionId,
    },
  };
}

export function sanitizeMetadata(
  raw: unknown
): Record<string, string | number | boolean> {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const entries = Object.entries(raw as Record<string, unknown>).slice(0, 8);
  const result: Record<string, string | number | boolean> = {};
  for (const [key, val] of entries) {
    if (key.length > 40) continue;
    if (typeof val === "string") {
      result[key] = val.slice(0, 140);
    } else if (typeof val === "number" && Number.isFinite(val)) {
      result[key] = val;
    } else if (typeof val === "boolean") {
      result[key] = val;
    }
  }
  return result;
}
