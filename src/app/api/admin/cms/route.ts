import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedAnalyticsRequest } from "@/lib/analyticsAuth";
import {
  deleteCmsMilestone,
  updateAdminSettings,
  updateCmsBranch,
  upsertCmsKnowledge,
  upsertCmsMilestone,
  type CmsBranchRecord,
  type CmsKnowledgeRecord,
  type CmsMilestoneRecord,
} from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!isAuthorizedAnalyticsRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
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
  const entity = typeof rec.entity === "string" ? rec.entity : "";

  if (entity === "milestone") {
    const payload = rec.data as Partial<CmsMilestoneRecord> | undefined;
    if (!payload?.company?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Company name is required." },
        { status: 400 }
      );
    }
    const id =
      payload.id?.trim() ||
      `ms-${payload.company
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .slice(0, 32)}-${Date.now().toString(36)}`;
    const saved = await upsertCmsMilestone(
      { ...payload, id },
      payload.id ? "updated" : "created"
    );
    return NextResponse.json({ ok: true, milestone: saved }, { status: 200 });
  }

  if (entity === "branch") {
    const payload = rec.data as Partial<CmsBranchRecord> | undefined;
    if (!payload?.id) {
      return NextResponse.json(
        { ok: false, error: "Branch ID is required." },
        { status: 400 }
      );
    }
    const saved = await updateCmsBranch({
      ...payload,
      id: payload.id,
    });
    return NextResponse.json({ ok: true, branch: saved }, { status: 200 });
  }

  if (entity === "knowledge") {
    const payload = rec.data as Partial<CmsKnowledgeRecord> | undefined;
    if (!payload?.title?.trim() || !payload?.content?.trim()) {
      return NextResponse.json(
        { ok: false, error: "Title and content are required." },
        { status: 400 }
      );
    }
    const id =
      payload.id?.trim() || `kb-${Date.now().toString(36)}`;
    const saved = await upsertCmsKnowledge(
      { ...payload, id },
      payload.id ? "updated" : "created"
    );
    return NextResponse.json({ ok: true, knowledge: saved }, { status: 200 });
  }

  if (entity === "settings") {
    const payload = (rec.data ?? {}) as Record<string, unknown>;
    const saved = await updateAdminSettings({
      aiAssistantEnabled:
        typeof payload.aiAssistantEnabled === "boolean"
          ? payload.aiAssistantEnabled
          : undefined,
      leadQualificationEnabled:
        typeof payload.leadQualificationEnabled === "boolean"
          ? payload.leadQualificationEnabled
          : undefined,
      privacyNotice:
        typeof payload.privacyNotice === "string"
          ? payload.privacyNotice.slice(0, 400)
          : undefined,
      maxConversationTurns:
        typeof payload.maxConversationTurns === "number" &&
        payload.maxConversationTurns >= 2 &&
        payload.maxConversationTurns <= 20
          ? payload.maxConversationTurns
          : undefined,
    });
    return NextResponse.json({ ok: true, settings: saved }, { status: 200 });
  }

  return NextResponse.json(
    { ok: false, error: "Unsupported CMS entity." },
    { status: 400 }
  );
}

export async function DELETE(req: NextRequest) {
  if (!isAuthorizedAnalyticsRequest(req)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized." },
      { status: 401 }
    );
  }

  const entity = req.nextUrl.searchParams.get("entity");
  const id = req.nextUrl.searchParams.get("id");
  if (entity !== "milestone" || !id) {
    return NextResponse.json(
      { ok: false, error: "entity=milestone and id are required." },
      { status: 400 }
    );
  }

  const deleted = await deleteCmsMilestone(id);
  return NextResponse.json({ ok: deleted }, { status: deleted ? 200 : 404 });
}

