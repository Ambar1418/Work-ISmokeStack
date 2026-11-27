import fs from "node:fs/promises";
import path from "node:path";
import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import {
  AI_KNOWLEDGE_SEED,
  CAREER_MILESTONES,
  STRATEGY_BRANCHES,
  type CareerMilestone,
  type KnowledgeEntrySeed,
  type StrategyBranch,
} from "@/data/soniaData";

export type EngagementEventType =
  | "page_view"
  | "branch_selected"
  | "root_selected"
  | "trunk_selected"
  | "milestone_opened"
  | "case_study_opened"
  | "seed_opened"
  | "ai_opened"
  | "ai_question_submitted"
  | "ai_recommended_branch"
  | "diagnostic_started"
  | "diagnostic_completed"
  | "linkedin_clicked"
  | "contact_clicked"
  | "contact_submitted";

export type EnquiryStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "In Progress"
  | "Closed";

export type DateRangeFilter = "today" | "7d" | "30d" | "all";

export interface SessionRecord {
  sessionId: string;
  firstVisit: string;
  lastActivity: string;
  visitCount: number;
  diagnosticCompleted: boolean;
  contactClicked: boolean;
}

export interface EngagementEventRecord {
  id: number;
  eventType: EngagementEventType;
  sessionId: string;
  targetId: string | null;
  targetLabel: string | null;
  metadata: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface AiInteractionRecord {
  id: number;
  sessionId: string;
  question: string;
  challengeCategory: string | null;
  answerSummary: string;
  recommendedBranch: string | null;
  milestonesReturned: string[];
  modelUsed: string | null;
  status: "ok" | "unanswered" | "error";
  errorMessage: string | null;
  createdAt: string;
}

export interface DiagnosticRecord {
  id: number;
  sessionId: string;
  challengeCategory: string;
  selectedAnswers: string[];
  businessDescription: string | null;
  aiAnalysis: string;
  recommendedActions: string[];
  recommendedBranches: string[];
  relevantExpertise: string[];
  completionStatus: string;
  createdAt: string;
}

export interface EnquiryRecord {
  id: number;
  name: string;
  email: string;
  company: string | null;
  businessChallenge: string;
  subject: string;
  message: string;
  aiClassification: string;
  relevantBranch: string | null;
  status: EnquiryStatus;
  internalNotes: string;
  sessionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CmsBranchRecord extends StrategyBranch {
  published: boolean;
  updatedAt: string;
}

export interface CmsMilestoneRecord extends CareerMilestone {
  published: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface CmsKnowledgeRecord extends KnowledgeEntrySeed {
  updatedAt: string;
}

export interface RevisionRecord {
  id: number;
  entityType: string;
  entityId: string;
  action: string;
  summary: string;
  createdAt: string;
}

export interface AdminSettingsRecord {
  aiAssistantEnabled: boolean;
  privacyNotice: string;
  leadQualificationEnabled: boolean;
  maxConversationTurns: number;
}

export interface StrategyIntelligencePayload {
  storageMode: "mysql" | "local_file";
  range: DateRangeFilter;
  overview: {
    totalVisitors: number;
    uniqueVisitors: number;
    returningVisitors: number;
    avgSessionDurationSec: number;
    treeExplorationRate: number;
    aiAssistantUsage: number;
    diagnosticCompletions: number;
    totalEnquiries: number;
    conversionRate: number;
    linkedinClicks: number;
    contactClicks: number;
  };
  charts: {
    dailyActivity: Array<{
      date: string;
      visitors: number;
      events: number;
      aiCalls: number;
      enquiries: number;
    }>;
    challengeDistribution: Array<{ label: string; count: number }>;
  };
  visitors: Array<{
    sessionId: string;
    firstVisit: string;
    lastActivity: string;
    visitCount: number;
    branchesExplored: string[];
    milestonesOpened: string[];
    aiInteractions: number;
    diagnosticCompleted: boolean;
    contactActions: number;
  }>;
  liveActivity: EngagementEventRecord[];
  aiStats: {
    totalQuestions: number;
    unansweredCount: number;
    errorCount: number;
    topQuestions: Array<{ question: string; count: number }>;
    topBranches: Array<{ id: string; count: number }>;
    recentInteractions: AiInteractionRecord[];
  };
  diagnostics: DiagnosticRecord[];
  enquiries: EnquiryRecord[];
  treeHeatmap: {
    roots: Array<{ id: string; count: number }>;
    trunk: Array<{ id: string; count: number }>;
    branches: Array<{
      id: string;
      label: string;
      clicks: number;
      uniqueSessions: number;
      aiRecommendations: number;
      contactConversions: number;
      topMilestones: Array<{ id: string; count: number }>;
    }>;
    leaves: Array<{ id: string; label: string; count: number }>;
    fruits: Array<{ id: string; label: string; count: number }>;
    seeds: Array<{ id: string; count: number }>;
  };
  cms: {
    branches: CmsBranchRecord[];
    milestones: CmsMilestoneRecord[];
    knowledge: CmsKnowledgeRecord[];
    revisions: RevisionRecord[];
  };
  settings: AdminSettingsRecord;
}

interface LocalStore {
  nextEventId: number;
  nextAiId: number;
  nextDiagId: number;
  nextEnquiryId: number;
  nextRevisionId: number;
  sessions: Record<string, SessionRecord>;
  events: EngagementEventRecord[];
  aiInteractions: AiInteractionRecord[];
  diagnostics: DiagnosticRecord[];
  enquiries: Array<EnquiryRecord & { ipHash: string | null }>;
  branches: CmsBranchRecord[];
  milestones: CmsMilestoneRecord[];
  knowledge: CmsKnowledgeRecord[];
  revisions: RevisionRecord[];
  settings: AdminSettingsRecord;
}

const DEFAULT_SETTINGS: AdminSettingsRecord = {
  aiAssistantEnabled: true,
  privacyNotice:
    "Anonymous session telemetry helps improve the Living Strategy Tree. No personal visitor profiles are tracked without your consent.",
  leadQualificationEnabled: true,
  maxConversationTurns: 8,
};

const LOCAL_STORE_PATH = path.join(process.cwd(), ".data", "portfolio-store.json");

let mysqlPool: Pool | null = null;
let schemaInitialized = false;
let localWriteChain: Promise<unknown> = Promise.resolve();

function getDatabaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.MYSQL_URL || undefined;
}

function isMysqlConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

function assertStorageAvailable(): void {
  if (
    !isMysqlConfigured() &&
    (process.env.VERCEL === "1" || process.env.NODE_ENV === "production")
  ) {
    throw new Error(
      "Database not configured. Set DATABASE_URL (MySQL) in your deployment environment."
    );
  }
}

function getMysqlPool(): Pool {
  const uri = getDatabaseUrl();
  if (!uri) {
    throw new Error("DATABASE_URL is not configured.");
  }
  if (!mysqlPool) {
    const isLocalHost =
      uri.includes("@localhost") || uri.includes("@127.0.0.1");
    const hasExplicitSsl = uri.toLowerCase().includes("ssl=");

    mysqlPool = mysql.createPool({
      uri,
      connectionLimit: 6,
      timezone: "Z",
      ...(!isLocalHost && !hasExplicitSsl
        ? { ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true } }
        : {}),
    });
  }
  return mysqlPool;
}

function parseJsonCol<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return val as T;
}

function toIso(val: unknown): string {
  if (val instanceof Date) return val.toISOString();
  if (typeof val === "string") return new Date(val).toISOString();
  return new Date().toISOString();
}

function seedBranches(): CmsBranchRecord[] {
  const now = new Date().toISOString();
  return STRATEGY_BRANCHES.map((b) => ({
    ...b,
    published: true,
    updatedAt: now,
  }));
}

function seedMilestones(): CmsMilestoneRecord[] {
  const now = new Date().toISOString();
  return CAREER_MILESTONES.map((m, idx) => ({
    ...m,
    published: true,
    sortOrder: idx,
    updatedAt: now,
  }));
}

function seedKnowledge(): CmsKnowledgeRecord[] {
  const now = new Date().toISOString();
  return AI_KNOWLEDGE_SEED.map((k) => ({
    ...k,
    updatedAt: now,
  }));
}

async function ensureMysqlSchema(pool: Pool): Promise<void> {
  if (schemaInitialized) return;

  const statements = [
    `CREATE TABLE IF NOT EXISTS anonymous_sessions (
      session_id VARCHAR(64) PRIMARY KEY,
      first_visit DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      last_activity DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      visit_count INT NOT NULL DEFAULT 1,
      diagnostic_completed BOOLEAN NOT NULL DEFAULT FALSE,
      contact_clicked BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS engagement_events (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      event_type VARCHAR(64) NOT NULL,
      session_id VARCHAR(64) NOT NULL,
      target_id VARCHAR(120),
      target_label VARCHAR(180),
      metadata JSON NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_interactions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      question TEXT NOT NULL,
      challenge_category VARCHAR(120),
      answer_summary TEXT NOT NULL,
      recommended_branch VARCHAR(64),
      milestones_returned JSON NOT NULL,
      model_used VARCHAR(80),
      status VARCHAR(32) NOT NULL DEFAULT 'ok',
      error_message TEXT,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS diagnostics (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      challenge_category VARCHAR(120) NOT NULL,
      selected_answers JSON NOT NULL,
      business_description TEXT,
      ai_analysis TEXT NOT NULL,
      recommended_actions JSON NOT NULL,
      recommended_branches JSON NOT NULL,
      relevant_expertise JSON NOT NULL,
      completion_status VARCHAR(32) NOT NULL DEFAULT 'completed',
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS enquiries (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(254) NOT NULL,
      company VARCHAR(160),
      business_challenge VARCHAR(180) NOT NULL,
      subject VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      ai_classification VARCHAR(120) NOT NULL DEFAULT 'General Strategy',
      relevant_branch VARCHAR(64),
      status VARCHAR(32) NOT NULL DEFAULT 'New',
      internal_notes TEXT NOT NULL,
      session_id VARCHAR(64),
      ip_hash VARCHAR(64),
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS tree_branches (
      id VARCHAR(64) PRIMARY KEY,
      label VARCHAR(80) NOT NULL,
      essence VARCHAR(180) NOT NULL,
      description TEXT NOT NULL,
      featured_company_id VARCHAR(64) NOT NULL,
      company_ids JSON NOT NULL,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS career_milestones (
      id VARCHAR(64) PRIMARY KEY,
      company VARCHAR(140) NOT NULL,
      chapter_label VARCHAR(140) NOT NULL,
      track VARCHAR(32) NOT NULL DEFAULT 'chronological',
      overall_span VARCHAR(120) NOT NULL,
      roles JSON NOT NULL,
      highlights JSON NOT NULL,
      fruit_outcome TEXT,
      branch_ids JSON NOT NULL,
      is_featured_leaf BOOLEAN NOT NULL DEFAULT FALSE,
      published BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS ai_knowledge_base (
      id VARCHAR(64) PRIMARY KEY,
      category VARCHAR(48) NOT NULL,
      title VARCHAR(180) NOT NULL,
      content TEXT NOT NULL,
      branch_id VARCHAR(64),
      published BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS content_revisions (
      id BIGINT AUTO_INCREMENT PRIMARY KEY,
      entity_type VARCHAR(48) NOT NULL,
      entity_id VARCHAR(64) NOT NULL,
      action VARCHAR(32) NOT NULL,
      summary TEXT NOT NULL,
      created_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )`,
    `CREATE TABLE IF NOT EXISTS admin_settings (
      setting_key VARCHAR(64) PRIMARY KEY,
      setting_value JSON NOT NULL,
      updated_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
    )`,
  ];

  for (const sql of statements) {
    await pool.query(sql);
  }

  const [bRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM tree_branches`
  );
  if (Number(bRows[0]?.cnt ?? 0) === 0) {
    for (const b of seedBranches()) {
      await pool.query(
        `INSERT IGNORE INTO tree_branches (id, label, essence, description, featured_company_id, company_ids, published)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          b.id,
          b.label,
          b.essence,
          b.description,
          b.featuredCompanyId,
          JSON.stringify(b.companyIds),
          b.published,
        ]
      );
    }
  }

  const [mRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM career_milestones`
  );
  if (Number(mRows[0]?.cnt ?? 0) === 0) {
    for (const m of seedMilestones()) {
      await pool.query(
        `INSERT IGNORE INTO career_milestones (id, company, chapter_label, track, overall_span, roles, highlights, fruit_outcome, branch_ids, is_featured_leaf, published, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          m.id,
          m.company,
          m.chapterLabel,
          m.track,
          m.overallSpan,
          JSON.stringify(m.roles),
          JSON.stringify(m.highlights),
          m.fruitOutcome ?? null,
          JSON.stringify(m.branchIds),
          Boolean(m.isFeaturedLeaf),
          m.published,
          m.sortOrder,
        ]
      );
    }
  }

  const [kRows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS cnt FROM ai_knowledge_base`
  );
  if (Number(kRows[0]?.cnt ?? 0) === 0) {
    for (const k of seedKnowledge()) {
      await pool.query(
        `INSERT IGNORE INTO ai_knowledge_base (id, category, title, content, branch_id, published)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [k.id, k.category, k.title, k.content, k.branchId ?? null, k.published]
      );
    }
  }

  await pool.query(
    `INSERT IGNORE INTO admin_settings (setting_key, setting_value) VALUES ('portal', ?)`,
    [JSON.stringify(DEFAULT_SETTINGS)]
  );

  schemaInitialized = true;
}

async function readLocalStore(): Promise<LocalStore> {
  try {
    const raw = await fs.readFile(LOCAL_STORE_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return {
      nextEventId: parsed.nextEventId ?? 1,
      nextAiId: parsed.nextAiId ?? 1,
      nextDiagId: parsed.nextDiagId ?? 1,
      nextEnquiryId: parsed.nextEnquiryId ?? 1,
      nextRevisionId: parsed.nextRevisionId ?? 1,
      sessions: parsed.sessions ?? {},
      events: Array.isArray(parsed.events) ? parsed.events : [],
      aiInteractions: Array.isArray(parsed.aiInteractions)
        ? parsed.aiInteractions
        : [],
      diagnostics: Array.isArray(parsed.diagnostics) ? parsed.diagnostics : [],
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
      branches:
        Array.isArray(parsed.branches) && parsed.branches.length > 0
          ? parsed.branches
          : seedBranches(),
      milestones:
        Array.isArray(parsed.milestones) && parsed.milestones.length > 0
          ? parsed.milestones
          : seedMilestones(),
      knowledge:
        Array.isArray(parsed.knowledge) && parsed.knowledge.length > 0
          ? parsed.knowledge
          : seedKnowledge(),
      revisions: Array.isArray(parsed.revisions) ? parsed.revisions : [],
      settings: parsed.settings ?? DEFAULT_SETTINGS,
    };
  } catch {
    return {
      nextEventId: 1,
      nextAiId: 1,
      nextDiagId: 1,
      nextEnquiryId: 1,
      nextRevisionId: 1,
      sessions: {},
      events: [],
      aiInteractions: [],
      diagnostics: [],
      enquiries: [],
      branches: seedBranches(),
      milestones: seedMilestones(),
      knowledge: seedKnowledge(),
      revisions: [],
      settings: DEFAULT_SETTINGS,
    };
  }
}

async function withLocalStore<T>(
  mutator: (store: LocalStore) => Promise<T> | T
): Promise<T> {
  const run = localWriteChain.then(async () => {
    const store = await readLocalStore();
    const result = await mutator(store);
    await fs.mkdir(path.dirname(LOCAL_STORE_PATH), { recursive: true });
    await fs.writeFile(LOCAL_STORE_PATH, JSON.stringify(store, null, 2), "utf-8");
    return result;
  });
  localWriteChain = run.catch(() => undefined);
  return run;
}

function cutoffForRange(range: DateRangeFilter): number | null {
  const now = new Date();
  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }
  if (range === "7d") return now.getTime() - 7 * 86400 * 1000;
  if (range === "30d") return now.getTime() - 30 * 86400 * 1000;
  return null;
}

export async function getPublishedPortfolioData(): Promise<{
  branches: CmsBranchRecord[];
  milestones: CmsMilestoneRecord[];
  knowledge: CmsKnowledgeRecord[];
  settings: AdminSettingsRecord;
}> {
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [[bRows], [mRows], [kRows], [sRows]] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT * FROM tree_branches WHERE published = TRUE ORDER BY id`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM career_milestones WHERE published = TRUE ORDER BY sort_order ASC, id ASC`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM ai_knowledge_base WHERE published = TRUE ORDER BY id`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT setting_value FROM admin_settings WHERE setting_key = 'portal'`
      ),
    ]);

    return {
      branches: bRows.map((r) => ({
        id: r.id as StrategyBranch["id"],
        label: String(r.label),
        essence: String(r.essence),
        description: String(r.description),
        featuredCompanyId: String(r.featured_company_id),
        companyIds: parseJsonCol<string[]>(r.company_ids, []),
        published: Boolean(r.published),
        updatedAt: toIso(r.updated_at),
      })),
      milestones: mRows.map((r) => ({
        id: String(r.id),
        company: String(r.company),
        chapterLabel: String(r.chapter_label),
        track: (r.track as "chronological" | "parallel") ?? "chronological",
        overallSpan: String(r.overall_span),
        roles: parseJsonCol<CareerMilestone["roles"]>(r.roles, []),
        highlights: parseJsonCol<string[]>(r.highlights, []),
        fruitOutcome: r.fruit_outcome ? String(r.fruit_outcome) : undefined,
        branchIds: parseJsonCol<StrategyBranch["id"][]>(r.branch_ids, []),
        isFeaturedLeaf: Boolean(r.is_featured_leaf),
        published: Boolean(r.published),
        sortOrder: Number(r.sort_order ?? 0),
        updatedAt: toIso(r.updated_at),
      })),
      knowledge: kRows.map((r) => ({
        id: String(r.id),
        category: r.category as KnowledgeEntrySeed["category"],
        title: String(r.title),
        content: String(r.content),
        branchId: r.branch_id
          ? (String(r.branch_id) as StrategyBranch["id"])
          : undefined,
        published: Boolean(r.published),
        updatedAt: toIso(r.updated_at),
      })),
      settings: {
        ...DEFAULT_SETTINGS,
        ...parseJsonCol<Partial<AdminSettingsRecord>>(
          sRows[0]?.setting_value,
          {}
        ),
      },
    };
  }

  const store = await readLocalStore();
  return {
    branches: store.branches.filter((b) => b.published),
    milestones: store.milestones
      .filter((m) => m.published)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    knowledge: store.knowledge.filter((k) => k.published),
    settings: store.settings,
  };
}

export async function insertEngagementEvent(input: {
  eventType: EngagementEventType;
  sessionId: string;
  targetId?: string | null;
  targetLabel?: string | null;
  metadata?: Record<string, string | number | boolean>;
}): Promise<{ id: number; createdAt: string }> {
  if (process.env.VERCEL === "1" && !isMysqlConfigured()) {
    assertStorageAvailable();
  }

  const nowIso = new Date().toISOString();

  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);

    const isPageView = input.eventType === "page_view" ? 1 : 0;
    const isDiag = input.eventType === "diagnostic_completed";
    const isContact =
      input.eventType === "contact_clicked" ||
      input.eventType === "linkedin_clicked" ||
      input.eventType === "contact_submitted";

    await pool.query(
      `INSERT INTO anonymous_sessions (session_id, first_visit, last_activity, visit_count, diagnostic_completed, contact_clicked)
       VALUES (?, NOW(3), NOW(3), ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         last_activity = NOW(3),
         visit_count = visit_count + VALUES(visit_count),
         diagnostic_completed = diagnostic_completed OR VALUES(diagnostic_completed),
         contact_clicked = contact_clicked OR VALUES(contact_clicked)`,
      [input.sessionId, isPageView, isDiag, isContact]
    );

    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO engagement_events (event_type, session_id, target_id, target_label, metadata)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.eventType,
        input.sessionId,
        input.targetId ?? null,
        input.targetLabel ?? null,
        JSON.stringify(input.metadata ?? {}),
      ]
    );

    return { id: Number(res.insertId), createdAt: nowIso };
  }

  return withLocalStore((store) => {
    const existing = store.sessions[input.sessionId];
    if (!existing) {
      store.sessions[input.sessionId] = {
        sessionId: input.sessionId,
        firstVisit: nowIso,
        lastActivity: nowIso,
        visitCount: 1,
        diagnosticCompleted: input.eventType === "diagnostic_completed",
        contactClicked:
          input.eventType === "contact_clicked" ||
          input.eventType === "linkedin_clicked" ||
          input.eventType === "contact_submitted",
      };
    } else {
      existing.lastActivity = nowIso;
      if (input.eventType === "page_view") existing.visitCount += 1;
      if (input.eventType === "diagnostic_completed") {
        existing.diagnosticCompleted = true;
      }
      if (
        input.eventType === "contact_clicked" ||
        input.eventType === "linkedin_clicked" ||
        input.eventType === "contact_submitted"
      ) {
        existing.contactClicked = true;
      }
    }

    const ev: EngagementEventRecord = {
      id: store.nextEventId++,
      eventType: input.eventType,
      sessionId: input.sessionId,
      targetId: input.targetId ?? null,
      targetLabel: input.targetLabel ?? null,
      metadata: input.metadata ?? {},
      createdAt: nowIso,
    };
    store.events.unshift(ev);
    if (store.events.length > 8000) store.events.length = 8000;
    return { id: ev.id, createdAt: ev.createdAt };
  });
}

export async function insertAiInteraction(input: {
  sessionId: string;
  question: string;
  challengeCategory?: string | null;
  answerSummary: string;
  recommendedBranch?: string | null;
  milestonesReturned?: string[];
  modelUsed?: string | null;
  status: "ok" | "unanswered" | "error";
  errorMessage?: string | null;
}): Promise<AiInteractionRecord> {
  if (process.env.VERCEL === "1" && !isMysqlConfigured()) {
    assertStorageAvailable();
  }

  const nowIso = new Date().toISOString();

  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO ai_interactions (session_id, question, challenge_category, answer_summary, recommended_branch, milestones_returned, model_used, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.sessionId,
        input.question,
        input.challengeCategory ?? null,
        input.answerSummary,
        input.recommendedBranch ?? null,
        JSON.stringify(input.milestonesReturned ?? []),
        input.modelUsed ?? null,
        input.status,
        input.errorMessage ?? null,
      ]
    );
    return {
      id: Number(res.insertId),
      sessionId: input.sessionId,
      question: input.question,
      challengeCategory: input.challengeCategory ?? null,
      answerSummary: input.answerSummary,
      recommendedBranch: input.recommendedBranch ?? null,
      milestonesReturned: input.milestonesReturned ?? [],
      modelUsed: input.modelUsed ?? null,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
      createdAt: nowIso,
    };
  }

  return withLocalStore((store) => {
    const rec: AiInteractionRecord = {
      id: store.nextAiId++,
      sessionId: input.sessionId,
      question: input.question,
      challengeCategory: input.challengeCategory ?? null,
      answerSummary: input.answerSummary,
      recommendedBranch: input.recommendedBranch ?? null,
      milestonesReturned: input.milestonesReturned ?? [],
      modelUsed: input.modelUsed ?? null,
      status: input.status,
      errorMessage: input.errorMessage ?? null,
      createdAt: nowIso,
    };
    store.aiInteractions.unshift(rec);
    return rec;
  });
}

export async function insertDiagnosticRecord(input: {
  sessionId: string;
  challengeCategory: string;
  selectedAnswers: string[];
  businessDescription?: string | null;
  aiAnalysis: string;
  recommendedActions: string[];
  recommendedBranches: string[];
  relevantExpertise: string[];
}): Promise<DiagnosticRecord> {
  if (process.env.VERCEL === "1" && !isMysqlConfigured()) {
    assertStorageAvailable();
  }

  const nowIso = new Date().toISOString();

  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO diagnostics (session_id, challenge_category, selected_answers, business_description, ai_analysis, recommended_actions, recommended_branches, relevant_expertise, completion_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [
        input.sessionId,
        input.challengeCategory,
        JSON.stringify(input.selectedAnswers),
        input.businessDescription ?? null,
        input.aiAnalysis,
        JSON.stringify(input.recommendedActions),
        JSON.stringify(input.recommendedBranches),
        JSON.stringify(input.relevantExpertise),
      ]
    );
    return {
      id: Number(res.insertId),
      sessionId: input.sessionId,
      challengeCategory: input.challengeCategory,
      selectedAnswers: input.selectedAnswers,
      businessDescription: input.businessDescription ?? null,
      aiAnalysis: input.aiAnalysis,
      recommendedActions: input.recommendedActions,
      recommendedBranches: input.recommendedBranches,
      relevantExpertise: input.relevantExpertise,
      completionStatus: "completed",
      createdAt: nowIso,
    };
  }

  return withLocalStore((store) => {
    const rec: DiagnosticRecord = {
      id: store.nextDiagId++,
      sessionId: input.sessionId,
      challengeCategory: input.challengeCategory,
      selectedAnswers: input.selectedAnswers,
      businessDescription: input.businessDescription ?? null,
      aiAnalysis: input.aiAnalysis,
      recommendedActions: input.recommendedActions,
      recommendedBranches: input.recommendedBranches,
      relevantExpertise: input.relevantExpertise,
      completionStatus: "completed",
      createdAt: nowIso,
    };
    store.diagnostics.unshift(rec);
    return rec;
  });
}

export async function hasRecentDuplicateEnquiry(
  email: string,
  subject: string,
  message: string
): Promise<boolean> {
  const e = email.trim().toLowerCase();
  const s = subject.trim().toLowerCase();
  const m = message.trim().toLowerCase();

  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM enquiries
       WHERE LOWER(email) = ? AND LOWER(subject) = ? AND LOWER(message) = ?
         AND created_at > DATE_SUB(NOW(3), INTERVAL 10 MINUTE)
       LIMIT 1`,
      [e, s, m]
    );
    return rows.length > 0;
  }

  const store = await readLocalStore();
  const cutoff = Date.now() - 10 * 60 * 1000;
  return store.enquiries.some(
    (item) =>
      item.email.toLowerCase() === e &&
      item.subject.toLowerCase() === s &&
      item.message.toLowerCase() === m &&
      new Date(item.createdAt).getTime() > cutoff
  );
}

export async function insertEnquiry(input: {
  name: string;
  email: string;
  company?: string | null;
  businessChallenge: string;
  subject: string;
  message: string;
  aiClassification: string;
  relevantBranch?: string | null;
  sessionId?: string | null;
  ipHash?: string | null;
}): Promise<EnquiryRecord> {
  if (process.env.VERCEL === "1" && !isMysqlConfigured()) {
    assertStorageAvailable();
  }

  const nowIso = new Date().toISOString();

  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [res] = await pool.query<ResultSetHeader>(
      `INSERT INTO enquiries (name, email, company, business_challenge, subject, message, ai_classification, relevant_branch, status, internal_notes, session_id, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', '', ?, ?)`,
      [
        input.name,
        input.email,
        input.company ?? null,
        input.businessChallenge,
        input.subject,
        input.message,
        input.aiClassification,
        input.relevantBranch ?? null,
        input.sessionId ?? null,
        input.ipHash ?? null,
      ]
    );
    return {
      id: Number(res.insertId),
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      businessChallenge: input.businessChallenge,
      subject: input.subject,
      message: input.message,
      aiClassification: input.aiClassification,
      relevantBranch: input.relevantBranch ?? null,
      status: "New",
      internalNotes: "",
      sessionId: input.sessionId ?? null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
  }

  return withLocalStore((store) => {
    const rec: EnquiryRecord & { ipHash: string | null } = {
      id: store.nextEnquiryId++,
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      businessChallenge: input.businessChallenge,
      subject: input.subject,
      message: input.message,
      aiClassification: input.aiClassification,
      relevantBranch: input.relevantBranch ?? null,
      status: "New",
      internalNotes: "",
      sessionId: input.sessionId ?? null,
      ipHash: input.ipHash ?? null,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    store.enquiries.unshift(rec);
    return {
      id: rec.id,
      name: rec.name,
      email: rec.email,
      company: rec.company,
      businessChallenge: rec.businessChallenge,
      subject: rec.subject,
      message: rec.message,
      aiClassification: rec.aiClassification,
      relevantBranch: rec.relevantBranch,
      status: rec.status,
      internalNotes: rec.internalNotes,
      sessionId: rec.sessionId,
      createdAt: rec.createdAt,
      updatedAt: rec.updatedAt,
    };
  });
}

export async function updateEnquiryAdmin(
  id: number,
  updates: { status?: EnquiryStatus; internalNotes?: string }
): Promise<EnquiryRecord | null> {
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    await pool.query(
      `UPDATE enquiries
       SET status = COALESCE(?, status),
           internal_notes = COALESCE(?, internal_notes),
           updated_at = NOW(3)
       WHERE id = ?`,
      [updates.status ?? null, updates.internalNotes ?? null, id]
    );
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM enquiries WHERE id = ? LIMIT 1`,
      [id]
    );
    const r = rows[0];
    if (!r) return null;
    return {
      id: Number(r.id),
      name: String(r.name),
      email: String(r.email),
      company: r.company ? String(r.company) : null,
      businessChallenge: String(r.business_challenge),
      subject: String(r.subject),
      message: String(r.message),
      aiClassification: String(r.ai_classification),
      relevantBranch: r.relevant_branch ? String(r.relevant_branch) : null,
      status: r.status as EnquiryStatus,
      internalNotes: String(r.internal_notes ?? ""),
      sessionId: r.session_id ? String(r.session_id) : null,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  }

  return withLocalStore((store) => {
    const target = store.enquiries.find((e) => e.id === id);
    if (!target) return null;
    if (updates.status) target.status = updates.status;
    if (typeof updates.internalNotes === "string") {
      target.internalNotes = updates.internalNotes;
    }
    target.updatedAt = new Date().toISOString();
    return {
      id: target.id,
      name: target.name,
      email: target.email,
      company: target.company,
      businessChallenge: target.businessChallenge,
      subject: target.subject,
      message: target.message,
      aiClassification: target.aiClassification,
      relevantBranch: target.relevantBranch,
      status: target.status,
      internalNotes: target.internalNotes,
      sessionId: target.sessionId,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt,
    };
  });
}

export async function upsertCmsMilestone(
  milestone: Partial<CmsMilestoneRecord> & { id: string },
  action: "created" | "updated"
): Promise<CmsMilestoneRecord> {
  const nowIso = new Date().toISOString();
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM career_milestones WHERE id = ? LIMIT 1`,
      [milestone.id]
    );
    const ex = rows[0];
    const merged: CmsMilestoneRecord = {
      id: milestone.id,
      company: milestone.company ?? (ex ? String(ex.company) : "Untitled Company"),
      chapterLabel:
        milestone.chapterLabel ??
        (ex ? String(ex.chapter_label) : "Career Milestone"),
      track:
        milestone.track ??
        (ex?.track as "chronological" | "parallel") ??
        "chronological",
      overallSpan:
        milestone.overallSpan ?? (ex ? String(ex.overall_span) : "Present"),
      roles:
        milestone.roles ??
        parseJsonCol<CareerMilestone["roles"]>(ex?.roles, []),
      highlights:
        milestone.highlights ?? parseJsonCol<string[]>(ex?.highlights, []),
      fruitOutcome:
        milestone.fruitOutcome !== undefined
          ? milestone.fruitOutcome
          : ex?.fruit_outcome
            ? String(ex.fruit_outcome)
            : undefined,
      branchIds:
        milestone.branchIds ??
        parseJsonCol<StrategyBranch["id"][]>(ex?.branch_ids, ["brand"]),
      isFeaturedLeaf:
        milestone.isFeaturedLeaf ?? Boolean(ex?.is_featured_leaf ?? false),
      published:
        milestone.published ?? (ex ? Boolean(ex.published) : true),
      sortOrder: milestone.sortOrder ?? Number(ex?.sort_order ?? 99),
      updatedAt: nowIso,
    };

    await pool.query(
      `INSERT INTO career_milestones (id, company, chapter_label, track, overall_span, roles, highlights, fruit_outcome, branch_ids, is_featured_leaf, published, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         company=VALUES(company), chapter_label=VALUES(chapter_label), track=VALUES(track),
         overall_span=VALUES(overall_span), roles=VALUES(roles), highlights=VALUES(highlights),
         fruit_outcome=VALUES(fruit_outcome), branch_ids=VALUES(branch_ids),
         is_featured_leaf=VALUES(is_featured_leaf), published=VALUES(published), sort_order=VALUES(sort_order)`,
      [
        merged.id,
        merged.company,
        merged.chapterLabel,
        merged.track,
        merged.overallSpan,
        JSON.stringify(merged.roles),
        JSON.stringify(merged.highlights),
        merged.fruitOutcome ?? null,
        JSON.stringify(merged.branchIds),
        Boolean(merged.isFeaturedLeaf),
        merged.published,
        merged.sortOrder,
      ]
    );
    await pool.query(
      `INSERT INTO content_revisions (entity_type, entity_id, action, summary) VALUES ('milestone', ?, ?, ?)`,
      [merged.id, action, `${action} milestone: ${merged.company}`]
    );
    return merged;
  }

  return withLocalStore((store) => {
    const idx = store.milestones.findIndex((m) => m.id === milestone.id);
    const ex = idx >= 0 ? store.milestones[idx] : undefined;
    const merged: CmsMilestoneRecord = {
      id: milestone.id,
      company: milestone.company ?? ex?.company ?? "Untitled Company",
      chapterLabel:
        milestone.chapterLabel ?? ex?.chapterLabel ?? "Career Milestone",
      track: milestone.track ?? ex?.track ?? "chronological",
      overallSpan: milestone.overallSpan ?? ex?.overallSpan ?? "Present",
      roles: milestone.roles ?? ex?.roles ?? [],
      highlights: milestone.highlights ?? ex?.highlights ?? [],
      fruitOutcome:
        milestone.fruitOutcome !== undefined
          ? milestone.fruitOutcome
          : ex?.fruitOutcome,
      branchIds: milestone.branchIds ?? ex?.branchIds ?? ["brand"],
      isFeaturedLeaf: milestone.isFeaturedLeaf ?? ex?.isFeaturedLeaf ?? false,
      published: milestone.published ?? ex?.published ?? true,
      sortOrder: milestone.sortOrder ?? ex?.sortOrder ?? store.milestones.length,
      updatedAt: nowIso,
    };
    if (idx >= 0) store.milestones[idx] = merged;
    else store.milestones.push(merged);
    store.revisions.unshift({
      id: store.nextRevisionId++,
      entityType: "milestone",
      entityId: merged.id,
      action,
      summary: `${action} milestone: ${merged.company}`,
      createdAt: nowIso,
    });
    return merged;
  });
}

export async function deleteCmsMilestone(id: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [res] = await pool.query<ResultSetHeader>(
      `DELETE FROM career_milestones WHERE id = ?`,
      [id]
    );
    if (res.affectedRows > 0) {
      await pool.query(
        `INSERT INTO content_revisions (entity_type, entity_id, action, summary) VALUES ('milestone', ?, 'deleted', ?)`,
        [id, `deleted milestone: ${id}`]
      );
      return true;
    }
    return false;
  }

  return withLocalStore((store) => {
    const prevLen = store.milestones.length;
    store.milestones = store.milestones.filter((m) => m.id !== id);
    if (store.milestones.length < prevLen) {
      store.revisions.unshift({
        id: store.nextRevisionId++,
        entityType: "milestone",
        entityId: id,
        action: "deleted",
        summary: `deleted milestone: ${id}`,
        createdAt: nowIso,
      });
      return true;
    }
    return false;
  });
}

export async function upsertCmsKnowledge(
  entry: Partial<CmsKnowledgeRecord> & { id: string },
  action: "created" | "updated"
): Promise<CmsKnowledgeRecord> {
  const nowIso = new Date().toISOString();
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM ai_knowledge_base WHERE id = ? LIMIT 1`,
      [entry.id]
    );
    const ex = rows[0];
    const merged: CmsKnowledgeRecord = {
      id: entry.id,
      category:
        entry.category ??
        (ex?.category as KnowledgeEntrySeed["category"]) ??
        "insight",
      title: entry.title ?? (ex ? String(ex.title) : "Knowledge Entry"),
      content: entry.content ?? (ex ? String(ex.content) : ""),
      branchId:
        entry.branchId !== undefined
          ? entry.branchId
          : ex?.branch_id
            ? (String(ex.branch_id) as StrategyBranch["id"])
            : undefined,
      published: entry.published ?? (ex ? Boolean(ex.published) : true),
      updatedAt: nowIso,
    };
    await pool.query(
      `INSERT INTO ai_knowledge_base (id, category, title, content, branch_id, published)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         category=VALUES(category), title=VALUES(title), content=VALUES(content),
         branch_id=VALUES(branch_id), published=VALUES(published)`,
      [
        merged.id,
        merged.category,
        merged.title,
        merged.content,
        merged.branchId ?? null,
        merged.published,
      ]
    );
    await pool.query(
      `INSERT INTO content_revisions (entity_type, entity_id, action, summary) VALUES ('knowledge', ?, ?, ?)`,
      [merged.id, action, `${action} knowledge: ${merged.title}`]
    );
    return merged;
  }

  return withLocalStore((store) => {
    const idx = store.knowledge.findIndex((k) => k.id === entry.id);
    const ex = idx >= 0 ? store.knowledge[idx] : undefined;
    const merged: CmsKnowledgeRecord = {
      id: entry.id,
      category: entry.category ?? ex?.category ?? "insight",
      title: entry.title ?? ex?.title ?? "Knowledge Entry",
      content: entry.content ?? ex?.content ?? "",
      branchId: entry.branchId !== undefined ? entry.branchId : ex?.branchId,
      published: entry.published ?? ex?.published ?? true,
      updatedAt: nowIso,
    };
    if (idx >= 0) store.knowledge[idx] = merged;
    else store.knowledge.unshift(merged);
    store.revisions.unshift({
      id: store.nextRevisionId++,
      entityType: "knowledge",
      entityId: merged.id,
      action,
      summary: `${action} knowledge: ${merged.title}`,
      createdAt: nowIso,
    });
    return merged;
  });
}

export async function updateCmsBranch(
  branch: Partial<CmsBranchRecord> & { id: StrategyBranch["id"] }
): Promise<CmsBranchRecord | null> {
  const nowIso = new Date().toISOString();
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM tree_branches WHERE id = ? LIMIT 1`,
      [branch.id]
    );
    const ex = rows[0];
    if (!ex) return null;
    const merged: CmsBranchRecord = {
      id: ex.id as StrategyBranch["id"],
      label: branch.label ?? String(ex.label),
      essence: branch.essence ?? String(ex.essence),
      description: branch.description ?? String(ex.description),
      featuredCompanyId:
        branch.featuredCompanyId ?? String(ex.featured_company_id),
      companyIds:
        branch.companyIds ?? parseJsonCol<string[]>(ex.company_ids, []),
      published: branch.published ?? Boolean(ex.published),
      updatedAt: nowIso,
    };
    await pool.query(
      `UPDATE tree_branches SET label=?, essence=?, description=?, published=? WHERE id=?`,
      [
        merged.label,
        merged.essence,
        merged.description,
        merged.published,
        merged.id,
      ]
    );
    await pool.query(
      `INSERT INTO content_revisions (entity_type, entity_id, action, summary) VALUES ('branch', ?, 'updated', ?)`,
      [merged.id, `updated branch: ${merged.label}`]
    );
    return merged;
  }

  return withLocalStore((store) => {
    const target = store.branches.find((b) => b.id === branch.id);
    if (!target) return null;
    if (branch.label) target.label = branch.label;
    if (branch.essence) target.essence = branch.essence;
    if (branch.description) target.description = branch.description;
    if (typeof branch.published === "boolean") target.published = branch.published;
    target.updatedAt = nowIso;
    store.revisions.unshift({
      id: store.nextRevisionId++,
      entityType: "branch",
      entityId: target.id,
      action: "updated",
      summary: `updated branch: ${target.label}`,
      createdAt: nowIso,
    });
    return target;
  });
}

export async function updateAdminSettings(
  next: Partial<AdminSettingsRecord>
): Promise<AdminSettingsRecord> {
  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT setting_value FROM admin_settings WHERE setting_key = 'portal' LIMIT 1`
    );
    const curr = parseJsonCol<AdminSettingsRecord>(
      rows[0]?.setting_value,
      DEFAULT_SETTINGS
    );
    const merged = { ...curr, ...next };
    await pool.query(
      `INSERT INTO admin_settings (setting_key, setting_value) VALUES ('portal', ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [JSON.stringify(merged)]
    );
    return merged;
  }

  return withLocalStore((store) => {
    store.settings = { ...store.settings, ...next };
    return store.settings;
  });
}

function buildAnalyticsFromArrays(params: {
  storageMode: "mysql" | "local_file";
  range: DateRangeFilter;
  sessions: SessionRecord[];
  events: EngagementEventRecord[];
  aiInteractions: AiInteractionRecord[];
  diagnostics: DiagnosticRecord[];
  enquiries: EnquiryRecord[];
  branches: CmsBranchRecord[];
  milestones: CmsMilestoneRecord[];
  knowledge: CmsKnowledgeRecord[];
  revisions: RevisionRecord[];
  settings: AdminSettingsRecord;
}): StrategyIntelligencePayload {
  const cutoff = cutoffForRange(params.range);
  const inRange = (iso: string) =>
    cutoff === null || new Date(iso).getTime() >= cutoff;

  const events = params.events.filter((e) => inRange(e.createdAt));
  const aiList = params.aiInteractions.filter((a) => inRange(a.createdAt));
  const diagList = params.diagnostics.filter((d) => inRange(d.createdAt));
  const enquiryList = params.enquiries.filter((e) => inRange(e.createdAt));

  const sessionMap = new Map<string, SessionRecord>();
  for (const s of params.sessions) {
    if (cutoff === null || new Date(s.lastActivity).getTime() >= cutoff) {
      sessionMap.set(s.sessionId, s);
    }
  }

  const pageViewEvents = events.filter((e) => e.eventType === "page_view");
  const activeSessions = new Set(events.map((e) => e.sessionId));
  for (const sid of sessionMap.keys()) activeSessions.add(sid);

  const uniqueVisitors = activeSessions.size;
  const returningVisitors = Array.from(sessionMap.values()).filter(
    (s) => s.visitCount > 1
  ).length;

  const sessionBounds = new Map<string, { min: number; max: number }>();
  for (const ev of events) {
    const t = new Date(ev.createdAt).getTime();
    const b = sessionBounds.get(ev.sessionId);
    if (!b) sessionBounds.set(ev.sessionId, { min: t, max: t });
    else {
      if (t < b.min) b.min = t;
      if (t > b.max) b.max = t;
    }
  }
  const durations = Array.from(sessionBounds.values()).map(
    (b) => (b.max - b.min) / 1000
  );
  const avgSessionDurationSec =
    durations.length > 0
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

  const treeInteractionEvents = events.filter((e) =>
    [
      "branch_selected",
      "root_selected",
      "trunk_selected",
      "milestone_opened",
      "case_study_opened",
      "seed_opened",
    ].includes(e.eventType)
  );
  const sessionsWithTreeExplore = new Set(
    treeInteractionEvents.map((e) => e.sessionId)
  );
  const treeExplorationRate =
    uniqueVisitors > 0
      ? Math.round((sessionsWithTreeExplore.size / uniqueVisitors) * 100)
      : 0;

  const conversionRate =
    uniqueVisitors > 0
      ? Number(((enquiryList.length / uniqueVisitors) * 100).toFixed(1))
      : 0;

  const dayMap = new Map<
    string,
    { sessions: Set<string>; events: number; aiCalls: number; enquiries: number }
  >();
  const ensureDay = (iso: string) => {
    const key = iso.slice(0, 10);
    let bucket = dayMap.get(key);
    if (!bucket) {
      bucket = { sessions: new Set(), events: 0, aiCalls: 0, enquiries: 0 };
      dayMap.set(key, bucket);
    }
    return bucket;
  };
  for (const e of events) {
    const b = ensureDay(e.createdAt);
    b.sessions.add(e.sessionId);
    b.events += 1;
  }
  for (const a of aiList) ensureDay(a.createdAt).aiCalls += 1;
  for (const q of enquiryList) ensureDay(q.createdAt).enquiries += 1;

  const dailyActivity = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, b]) => ({
      date,
      visitors: b.sessions.size,
      events: b.events,
      aiCalls: b.aiCalls,
      enquiries: b.enquiries,
    }));

  const challengeCounts = new Map<string, number>();
  const bumpChallenge = (label: string | null | undefined) => {
    if (!label) return;
    challengeCounts.set(label, (challengeCounts.get(label) ?? 0) + 1);
  };
  for (const d of diagList) bumpChallenge(d.challengeCategory);
  for (const q of enquiryList) bumpChallenge(q.aiClassification);
  for (const a of aiList) bumpChallenge(a.challengeCategory);
  const challengeDistribution = Array.from(challengeCounts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const visitors = Array.from(sessionMap.values())
    .sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )
    .slice(0, 50)
    .map((s) => {
      const sEvents = events.filter((e) => e.sessionId === s.sessionId);
      const branchesExplored = Array.from(
        new Set(
          sEvents
            .filter((e) => e.eventType === "branch_selected" && e.targetLabel)
            .map((e) => e.targetLabel as string)
        )
      );
      const milestonesOpened = Array.from(
        new Set(
          sEvents
            .filter((e) => e.eventType === "milestone_opened" && e.targetLabel)
            .map((e) => e.targetLabel as string)
        )
      );
      const aiInteractions = aiList.filter(
        (a) => a.sessionId === s.sessionId
      ).length;
      const contactActions = sEvents.filter((e) =>
        ["contact_clicked", "linkedin_clicked", "contact_submitted"].includes(
          e.eventType
        )
      ).length;
      return {
        sessionId: s.sessionId,
        firstVisit: s.firstVisit,
        lastActivity: s.lastActivity,
        visitCount: s.visitCount,
        branchesExplored,
        milestonesOpened,
        aiInteractions,
        diagnosticCompleted: s.diagnosticCompleted,
        contactActions,
      };
    });

  const qCounts = new Map<string, number>();
  const aiBranchCounts = new Map<string, number>();
  for (const a of aiList) {
    qCounts.set(a.question, (qCounts.get(a.question) ?? 0) + 1);
    if (a.recommendedBranch) {
      aiBranchCounts.set(
        a.recommendedBranch,
        (aiBranchCounts.get(a.recommendedBranch) ?? 0) + 1
      );
    }
  }

  const countTargets = (filterTypes: EngagementEventType[]) => {
    const map = new Map<string, { id: string; label: string; count: number }>();
    for (const e of events) {
      if (!filterTypes.includes(e.eventType)) continue;
      const id = e.targetId || "unknown";
      const label = e.targetLabel || id;
      const prev = map.get(id);
      if (prev) prev.count += 1;
      else map.set(id, { id, label, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  };

  const branchHeatmap = params.branches.map((branch) => {
    const branchEvents = events.filter(
      (e) => e.eventType === "branch_selected" && e.targetId === branch.id
    );
    const uniqueSessions = new Set(branchEvents.map((e) => e.sessionId)).size;
    const aiRecommendations = aiList.filter(
      (a) => a.recommendedBranch === branch.id
    ).length;
    const contactConversions = enquiryList.filter(
      (q) => q.relevantBranch === branch.id
    ).length;

    const milestoneMap = new Map<string, number>();
    for (const e of events) {
      if (
        e.eventType === "milestone_opened" &&
        e.targetId &&
        branch.companyIds.includes(e.targetId)
      ) {
        milestoneMap.set(e.targetId, (milestoneMap.get(e.targetId) ?? 0) + 1);
      }
    }
    const topMilestones = Array.from(milestoneMap.entries())
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);

    return {
      id: branch.id,
      label: branch.label,
      clicks: branchEvents.length,
      uniqueSessions,
      aiRecommendations,
      contactConversions,
      topMilestones,
    };
  });

  return {
    storageMode: params.storageMode,
    range: params.range,
    overview: {
      totalVisitors: Math.max(pageViewEvents.length, uniqueVisitors),
      uniqueVisitors,
      returningVisitors,
      avgSessionDurationSec,
      treeExplorationRate,
      aiAssistantUsage: aiList.length,
      diagnosticCompletions: diagList.length,
      totalEnquiries: enquiryList.length,
      conversionRate,
      linkedinClicks: events.filter((e) => e.eventType === "linkedin_clicked")
        .length,
      contactClicks: events.filter((e) => e.eventType === "contact_clicked")
        .length,
    },
    charts: {
      dailyActivity,
      challengeDistribution,
    },
    visitors,
    liveActivity: events.slice(0, 40),
    aiStats: {
      totalQuestions: aiList.length,
      unansweredCount: aiList.filter((a) => a.status === "unanswered").length,
      errorCount: aiList.filter((a) => a.status === "error").length,
      topQuestions: Array.from(qCounts.entries())
        .map(([question, count]) => ({ question, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8),
      topBranches: Array.from(aiBranchCounts.entries())
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count),
      recentInteractions: aiList.slice(0, 25),
    },
    diagnostics: diagList.slice(0, 50),
    enquiries: enquiryList,
    treeHeatmap: {
      roots: countTargets(["root_selected"]).map(({ id, count }) => ({
        id,
        count,
      })),
      trunk: countTargets(["trunk_selected"]).map(({ id, count }) => ({
        id,
        count,
      })),
      branches: branchHeatmap,
      leaves: countTargets(["milestone_opened"]),
      fruits: countTargets(["case_study_opened"]),
      seeds: countTargets(["seed_opened"]).map(({ id, count }) => ({
        id,
        count,
      })),
    },
    cms: {
      branches: params.branches,
      milestones: params.milestones,
      knowledge: params.knowledge,
      revisions: params.revisions.slice(0, 30),
    },
    settings: params.settings,
  };
}

export async function getStrategyIntelligence(
  range: DateRangeFilter = "all"
): Promise<StrategyIntelligencePayload> {
  if (process.env.VERCEL === "1" && !isMysqlConfigured()) {
    assertStorageAvailable();
  }

  if (isMysqlConfigured()) {
    const pool = getMysqlPool();
    await ensureMysqlSchema(pool);

    const [
      [sRows],
      [eRows],
      [aRows],
      [dRows],
      [qRows],
      [bRows],
      [mRows],
      [kRows],
      [rRows],
      [setRows],
    ] = await Promise.all([
      pool.query<RowDataPacket[]>(
        `SELECT * FROM anonymous_sessions ORDER BY last_activity DESC LIMIT 200`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM engagement_events ORDER BY created_at DESC LIMIT 2500`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM ai_interactions ORDER BY created_at DESC LIMIT 200`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM diagnostics ORDER BY created_at DESC LIMIT 200`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200`
      ),
      pool.query<RowDataPacket[]>(`SELECT * FROM tree_branches ORDER BY id`),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM career_milestones ORDER BY sort_order ASC, id ASC`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM ai_knowledge_base ORDER BY id`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT * FROM content_revisions ORDER BY created_at DESC LIMIT 40`
      ),
      pool.query<RowDataPacket[]>(
        `SELECT setting_value FROM admin_settings WHERE setting_key = 'portal'`
      ),
    ]);

    return buildAnalyticsFromArrays({
      storageMode: "mysql",
      range,
      sessions: sRows.map((r) => ({
        sessionId: String(r.session_id),
        firstVisit: toIso(r.first_visit),
        lastActivity: toIso(r.last_activity),
        visitCount: Number(r.visit_count ?? 1),
        diagnosticCompleted: Boolean(r.diagnostic_completed),
        contactClicked: Boolean(r.contact_clicked),
      })),
      events: eRows.map((r) => ({
        id: Number(r.id),
        eventType: r.event_type as EngagementEventType,
        sessionId: String(r.session_id),
        targetId: r.target_id ? String(r.target_id) : null,
        targetLabel: r.target_label ? String(r.target_label) : null,
        metadata: parseJsonCol(r.metadata, {}),
        createdAt: toIso(r.created_at),
      })),
      aiInteractions: aRows.map((r) => ({
        id: Number(r.id),
        sessionId: String(r.session_id),
        question: String(r.question),
        challengeCategory: r.challenge_category
          ? String(r.challenge_category)
          : null,
        answerSummary: String(r.answer_summary),
        recommendedBranch: r.recommended_branch
          ? String(r.recommended_branch)
          : null,
        milestonesReturned: parseJsonCol<string[]>(r.milestones_returned, []),
        modelUsed: r.model_used ? String(r.model_used) : null,
        status: r.status as "ok" | "unanswered" | "error",
        errorMessage: r.error_message ? String(r.error_message) : null,
        createdAt: toIso(r.created_at),
      })),
      diagnostics: dRows.map((r) => ({
        id: Number(r.id),
        sessionId: String(r.session_id),
        challengeCategory: String(r.challenge_category),
        selectedAnswers: parseJsonCol<string[]>(r.selected_answers, []),
        businessDescription: r.business_description
          ? String(r.business_description)
          : null,
        aiAnalysis: String(r.ai_analysis),
        recommendedActions: parseJsonCol<string[]>(r.recommended_actions, []),
        recommendedBranches: parseJsonCol<string[]>(r.recommended_branches, []),
        relevantExpertise: parseJsonCol<string[]>(r.relevant_expertise, []),
        completionStatus: String(r.completion_status),
        createdAt: toIso(r.created_at),
      })),
      enquiries: qRows.map((r) => ({
        id: Number(r.id),
        name: String(r.name),
        email: String(r.email),
        company: r.company ? String(r.company) : null,
        businessChallenge: String(r.business_challenge),
        subject: String(r.subject),
        message: String(r.message),
        aiClassification: String(r.ai_classification),
        relevantBranch: r.relevant_branch ? String(r.relevant_branch) : null,
        status: r.status as EnquiryStatus,
        internalNotes: String(r.internal_notes ?? ""),
        sessionId: r.session_id ? String(r.session_id) : null,
        createdAt: toIso(r.created_at),
        updatedAt: toIso(r.updated_at),
      })),
      branches: bRows.map((r) => ({
        id: r.id as StrategyBranch["id"],
        label: String(r.label),
        essence: String(r.essence),
        description: String(r.description),
        featuredCompanyId: String(r.featured_company_id),
        companyIds: parseJsonCol<string[]>(r.company_ids, []),
        published: Boolean(r.published),
        updatedAt: toIso(r.updated_at),
      })),
      milestones: mRows.map((r) => ({
        id: String(r.id),
        company: String(r.company),
        chapterLabel: String(r.chapter_label),
        track: (r.track as "chronological" | "parallel") ?? "chronological",
        overallSpan: String(r.overall_span),
        roles: parseJsonCol<CareerMilestone["roles"]>(r.roles, []),
        highlights: parseJsonCol<string[]>(r.highlights, []),
        fruitOutcome: r.fruit_outcome ? String(r.fruit_outcome) : undefined,
        branchIds: parseJsonCol<StrategyBranch["id"][]>(r.branch_ids, []),
        isFeaturedLeaf: Boolean(r.is_featured_leaf),
        published: Boolean(r.published),
        sortOrder: Number(r.sort_order ?? 0),
        updatedAt: toIso(r.updated_at),
      })),
      knowledge: kRows.map((r) => ({
        id: String(r.id),
        category: r.category as KnowledgeEntrySeed["category"],
        title: String(r.title),
        content: String(r.content),
        branchId: r.branch_id
          ? (String(r.branch_id) as StrategyBranch["id"])
          : undefined,
        published: Boolean(r.published),
        updatedAt: toIso(r.updated_at),
      })),
      revisions: rRows.map((r) => ({
        id: Number(r.id),
        entityType: String(r.entity_type),
        entityId: String(r.entity_id),
        action: String(r.action),
        summary: String(r.summary),
        createdAt: toIso(r.created_at),
      })),
      settings: {
        ...DEFAULT_SETTINGS,
        ...parseJsonCol<Partial<AdminSettingsRecord>>(
          setRows[0]?.setting_value,
          {}
        ),
      },
    });
  }

  const store = await readLocalStore();
  return buildAnalyticsFromArrays({
    storageMode: "local_file",
    range,
    sessions: Object.values(store.sessions),
    events: store.events,
    aiInteractions: store.aiInteractions,
    diagnostics: store.diagnostics,
    enquiries: store.enquiries.map((q) => ({
      id: q.id,
      name: q.name,
      email: q.email,
      company: q.company,
      businessChallenge: q.businessChallenge,
      subject: q.subject,
      message: q.message,
      aiClassification: q.aiClassification,
      relevantBranch: q.relevantBranch,
      status: q.status,
      internalNotes: q.internalNotes,
      sessionId: q.sessionId,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    })),
    branches: store.branches,
    milestones: store.milestones,
    knowledge: store.knowledge,
    revisions: store.revisions,
    settings: store.settings,
  });
}
