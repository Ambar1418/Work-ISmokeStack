"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  Bot,
  Briefcase,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Lock,
  LogOut,
  Menu,
  RefreshCw,
  Settings,
  Sparkles,
  Stethoscope,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { StrategyBranch } from "@/data/soniaData";
import type {
  DateRangeFilter,
  EnquiryRecord,
  EnquiryStatus,
  StrategyIntelligencePayload,
} from "@/lib/db";

type AdminSection =
  | "overview"
  | "visitors"
  | "activity"
  | "ai"
  | "diagnostics"
  | "enquiries"
  | "tree"
  | "career"
  | "content"
  | "insights"
  | "settings";

const NAV_ITEMS: Array<{
  id: AdminSection;
  label: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "visitors", label: "Visitors", icon: Users },
  { id: "activity", label: "Live Activity", icon: Activity },
  { id: "ai", label: "AI Strategy Assistant", icon: Bot },
  { id: "diagnostics", label: "Business Diagnostics", icon: Stethoscope },
  { id: "enquiries", label: "Leads & Enquiries", icon: Briefcase },
  { id: "tree", label: "Tree Analytics", icon: GitBranch },
  { id: "career", label: "Career Management", icon: Briefcase },
  { id: "content", label: "Content Management", icon: BookOpen },
  { id: "insights", label: "AI Insights", icon: Lightbulb },
  { id: "settings", label: "Settings", icon: Settings },
];

const ENQUIRY_STATUSES: EnquiryStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "In Progress",
  "Closed",
];

export function AdminDashboard() {
  const [authState, setAuthState] = useState<
    "loading" | "unauthenticated" | "unconfigured" | "ready" | "error"
  >("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  const [section, setSection] = useState<AdminSection>("overview");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [range, setRange] = useState<DateRangeFilter>("all");
  const [data, setData] = useState<StrategyIntelligencePayload | null>(null);

  // Leads CRM filter state
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<"All" | EnquiryStatus>("All");
  const [savingLeadId, setSavingLeadId] = useState<number | null>(null);

  // Diagnostic filter state
  const [diagFilter, setDiagFilter] = useState("All");

  // Tree heatmap selected branch
  const [selectedHeatBranch, setSelectedHeatBranch] = useState<string>("brand");

  // CMS Career form
  const [newCompany, setNewCompany] = useState("");
  const [newChapter, setNewChapter] = useState("Advisory & Leadership");
  const [newSpan, setNewSpan] = useState("");
  const [newRoleTitle, setNewRoleTitle] = useState("");
  const [newHighlight, setNewHighlight] = useState("");
  const [newTrack, setNewTrack] = useState<"chronological" | "parallel">("parallel");
  const [newBranchId, setNewBranchId] = useState<StrategyBranch["id"]>("brand");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // CMS Knowledge form
  const [kbTitle, setKbTitle] = useState("");
  const [kbCategory, setKbCategory] = useState<
    "biography" | "career" | "expertise" | "achievement" | "insight" | "faq"
  >("insight");
  const [kbContent, setKbContent] = useState("");

  // AI Insights
  const [insightsData, setInsightsData] = useState<{
    sufficientData: boolean;
    mode: string;
    insights: string[];
    disclaimer: string;
  } | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Settings draft
  const [settingsMsg, setSettingsMsg] = useState("");

  const fetchDashboard = useCallback(async (selectedRange: DateRangeFilter) => {
    try {
      const res = await fetch(`/api/analytics?range=${selectedRange}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        analytics?: StrategyIntelligencePayload;
      };

      if (res.status === 401) {
        setAuthState("unauthenticated");
        return;
      }
      if (res.status === 503) {
        setAuthState("unconfigured");
        setErrorMsg(
          json.error ||
            "Configure ADMIN_ANALYTICS_SECRET in environment variables."
        );
        return;
      }
      if (!res.ok || !json.analytics) {
        setAuthState("error");
        setErrorMsg(json.error || "Failed to load dashboard.");
        return;
      }

      setData(json.analytics);
      setAuthState("ready");
    } catch {
      setAuthState("error");
      setErrorMsg("Network error loading dashboard.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      if (!active) return;
      await fetchDashboard(range);
    })();
    return () => {
      active = false;
    };
  }, [fetchDashboard, range]);

  // Live Activity auto-poll every 10s when viewing Live Activity
  useEffect(() => {
    if (authState !== "ready" || section !== "activity") return;
    const timer = setInterval(() => {
      void fetchDashboard(range);
    }, 10_000);
    return () => clearInterval(timer);
  }, [authState, section, range, fetchDashboard]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!passphrase.trim() || loggingIn) return;
    setLoggingIn(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/analytics/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: passphrase }),
      });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        setErrorMsg(json.error || "Invalid credentials.");
        setLoggingIn(false);
        return;
      }
      setPassphrase("");
      setLoggingIn(false);
      await fetchDashboard(range);
    } catch {
      setErrorMsg("Network error.");
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/analytics/auth", { method: "DELETE" });
    setData(null);
    setAuthState("unauthenticated");
  };

  const handleUpdateEnquiry = async (
    id: number,
    updates: { status?: EnquiryStatus; internalNotes?: string }
  ) => {
    setSavingLeadId(id);
    try {
      await fetch(`/api/admin/enquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      await fetchDashboard(range);
    } finally {
      setSavingLeadId(null);
    }
  };

  const handleAddMilestone = async (e: FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "milestone",
        data: {
          company: newCompany.trim(),
          chapterLabel: newChapter.trim() || "Career Milestone",
          overallSpan: newSpan.trim() || "Present",
          track: newTrack,
          roles: newRoleTitle.trim()
            ? [{ title: newRoleTitle.trim(), period: newSpan.trim() || "Present" }]
            : [],
          highlights: newHighlight.trim() ? [newHighlight.trim()] : [],
          branchIds: [newBranchId],
          published: true,
        },
      }),
    });
    setNewCompany("");
    setNewSpan("");
    setNewRoleTitle("");
    setNewHighlight("");
    await fetchDashboard(range);
  };

  const handleToggleMilestonePublish = async (
    id: string,
    published: boolean
  ) => {
    await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "milestone",
        data: { id, company: data?.cms.milestones.find((m) => m.id === id)?.company, published },
      }),
    });
    await fetchDashboard(range);
  };

  const handleDeleteMilestone = async (id: string) => {
    await fetch(`/api/admin/cms?entity=milestone&id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setConfirmDeleteId(null);
    await fetchDashboard(range);
  };

  const handleAddKnowledge = async (e: FormEvent) => {
    e.preventDefault();
    if (!kbTitle.trim() || !kbContent.trim()) return;
    await fetch("/api/admin/cms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "knowledge",
        data: {
          title: kbTitle.trim(),
          category: kbCategory,
          content: kbContent.trim(),
          published: true,
        },
      }),
    });
    setKbTitle("");
    setKbContent("");
    await fetchDashboard(range);
  };

  const handleGenerateInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await fetch("/api/admin/insights", { method: "POST" });
      const json = (await res.json()) as {
        sufficientData: boolean;
        mode: string;
        insights: string[];
        disclaimer: string;
      };
      setInsightsData(json);
    } finally {
      setLoadingInsights(false);
    }
  };

  const filteredEnquiries = useMemo(() => {
    if (!data) return [] as EnquiryRecord[];
    return data.enquiries.filter((e) => {
      if (leadStatusFilter !== "All" && e.status !== leadStatusFilter) {
        return false;
      }
      if (leadSearch.trim()) {
        const q = leadSearch.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.company ?? "").toLowerCase().includes(q) ||
          e.businessChallenge.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data, leadSearch, leadStatusFilter]);

  if (authState === "loading") {
    return (
      <div className="min-h-screen bg-[#0B1C15] text-[#F5F1E8] flex items-center justify-center font-mono text-xs uppercase tracking-[0.2em]">
        Loading Strategy Intelligence...
      </div>
    );
  }

  if (authState === "unconfigured" || authState === "unauthenticated" || authState === "error") {
    return (
      <div className="min-h-screen bg-[#0B1C15] text-[#F5F1E8] flex items-center justify-center p-5">
        <div className="w-full max-w-md rounded-2xl border border-[#9CB5A5]/20 bg-[#10261D] p-7 space-y-5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A65B]">
              Sonia Specialist · Strategy Intelligence
            </span>
            <Link
              href="/"
              className="font-mono text-[10px] uppercase text-[#9CB5A5] hover:text-[#F5F1E8]"
            >
              ← Tree
            </Link>
          </div>

          {authState === "unconfigured" ? (
            <div className="space-y-3">
              <h1 className="font-serif text-3xl">Server Secret Required</h1>
              <p className="text-sm text-[#9CB5A5]">{errorMsg}</p>
              <p className="text-xs text-[#9CB5A5]">
                Set <code className="font-mono text-[#F5F1E8]">ADMIN_ANALYTICS_SECRET</code>{" "}
                in <code className="font-mono text-[#F5F1E8]">.env.local</code> or Vercel environment variables.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="flex items-center gap-2 text-[#C9A65B]">
                <Lock className="h-4 w-4" />
                <h1 className="font-serif text-3xl text-[#F5F1E8]">
                  Administrator Sign In
                </h1>
              </div>
              <div>
                <label
                  htmlFor="admin-pass"
                  className="block font-mono text-[10px] uppercase tracking-[0.16em] text-[#9CB5A5] mb-1.5"
                >
                  Admin Passphrase
                </label>
                <input
                  id="admin-pass"
                  type="password"
                  required
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  placeholder="Enter ADMIN_ANALYTICS_SECRET"
                  className="w-full rounded-lg border border-[#9CB5A5]/25 bg-[#081510] px-3.5 py-2.5 text-sm text-[#F5F1E8] focus:border-[#C9A65B] focus:outline-none"
                />
              </div>
              {errorMsg && <p className="text-xs text-[#E89B82]">{errorMsg}</p>}
              <button
                type="submit"
                disabled={loggingIn}
                className="w-full rounded-full bg-[#C9A65B] py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] text-[#081510] font-medium"
              >
                {loggingIn ? "Authenticating..." : "Enter Strategy Intelligence"}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxBranchClicks = Math.max(
    1,
    ...data.treeHeatmap.branches.map((b) => b.clicks)
  );
  const currentHeatBranch =
    data.treeHeatmap.branches.find((b) => b.id === selectedHeatBranch) ??
    data.treeHeatmap.branches[0];

  return (
    <div className="min-h-screen flex bg-[#F5F1E8] text-[#12271E]">
      {/* DARK EVERGREEN SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 shrink-0 flex-col justify-between bg-[#0B1C15] text-[#F5F1E8] p-5 transition-transform md:static md:flex md:translate-x-0 ${
          mobileNavOpen ? "flex translate-x-0" : "hidden -translate-x-full"
        }`}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#9CB5A5]/15 pb-4">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#C9A65B]">
                Sonia Specialist
              </p>
              <p className="font-serif text-lg text-[#F5F1E8]">
                Strategy Intelligence
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-[#9CB5A5]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav aria-label="Admin navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSection(item.id);
                    setMobileNavOpen(false);
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                    active
                      ? "bg-[#173628] text-[#F5F1E8] border border-[#C9A65B]/45"
                      : "text-[#9CB5A5] hover:bg-[#11281E] hover:text-[#F5F1E8]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-[#C9A65B]" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sonia Profile & Logout */}
        <div className="space-y-3 border-t border-[#9CB5A5]/15 pt-4 pb-10 md:pb-12">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#193B2C] border border-[#C9A65B]/50 font-serif text-base text-[#F5F1E8]">
              S
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#F5F1E8] truncate">
                Sonia Specialist
              </p>
              <p className="font-mono text-[9.5px] text-[#9CB5A5]">
                Administrator
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-mono text-[10px] text-[#9CB5A5] hover:text-[#F5F1E8]"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Public Tree</span>
            </Link>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-[#C9A65B] hover:underline"
            >
              <LogOut className="h-3 w-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* WARM IVORY MAIN WORKSPACE */}
      <main className="flex-1 min-w-0 p-5 sm:p-8 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#12271E]/12 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="md:hidden rounded-lg border border-[#12271E]/20 p-2"
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#12271E]">
                {NAV_ITEMS.find((n) => n.id === section)?.label}
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#4B6858]">
                Source: {data.storageMode === "mysql" ? "MySQL" : "Local File Store"} · Real DB Records Only
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(["today", "7d", "30d", "all"] as DateRangeFilter[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase border ${
                  range === r
                    ? "border-[#12271E] bg-[#12271E] text-[#F5F1E8]"
                    : "border-[#12271E]/20 bg-white text-[#4B6858]"
                }`}
              >
                {r === "today"
                  ? "Today"
                  : r === "7d"
                    ? "Last 7d"
                    : r === "30d"
                      ? "Last 30d"
                      : "All time"}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void fetchDashboard(range)}
              className="inline-flex items-center gap-1 rounded-full border border-[#12271E]/20 bg-white px-3 py-1 font-mono text-[10px] uppercase"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {/* 1. OVERVIEW */}
        {section === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Total Visitors", value: data.overview.totalVisitors },
                { label: "Unique Visitors", value: data.overview.uniqueVisitors },
                { label: "Returning", value: data.overview.returningVisitors },
                {
                  label: "Avg Session",
                  value: `${data.overview.avgSessionDurationSec}s`,
                },
                {
                  label: "Tree Explore Rate",
                  value: `${data.overview.treeExplorationRate}%`,
                },
                { label: "AI Questions", value: data.overview.aiAssistantUsage },
                {
                  label: "Diagnostics",
                  value: data.overview.diagnosticCompletions,
                },
                { label: "Total Enquiries", value: data.overview.totalEnquiries },
                {
                  label: "Conversion Rate",
                  value: `${data.overview.conversionRate}%`,
                },
                {
                  label: "LinkedIn Clicks",
                  value: data.overview.linkedinClicks,
                },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-[#12271E]/12 bg-[#FAF7F0] p-4"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#4B6858]">
                    {kpi.label}
                  </p>
                  <p className="mt-1 font-serif text-3xl text-[#12271E]">
                    {kpi.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Daily Engagement Chart */}
              <div className="lg:col-span-7 rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                  Visitor Growth &amp; Daily Engagement
                </p>
                {data.charts.dailyActivity.length === 0 ? (
                  <p className="text-sm text-[#4B6858] py-8">
                    No visitor events recorded in this date window yet. Real activity bars will populate automatically as visitors explore the tree.
                  </p>
                ) : (
                  <div className="flex items-end gap-2 h-44 pt-4">
                    {(() => {
                      const maxEv = Math.max(
                        1,
                        ...data.charts.dailyActivity.map((d) => d.events)
                      );
                      return data.charts.dailyActivity.map((day) => {
                        const pct = Math.max(
                          8,
                          Math.round((day.events / maxEv) * 100)
                        );
                        return (
                          <div
                            key={day.date}
                            className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"
                          >
                            <span className="font-mono text-[9px] text-[#4B6858]">
                              {day.events}
                            </span>
                            <div
                              className="w-full max-w-[36px] rounded-t-md bg-[#12271E]"
                              style={{ height: `${pct}%` }}
                              title={`${day.date}: ${day.visitors} visitors, ${day.events} events, ${day.aiCalls} AI, ${day.enquiries} enquiries`}
                            />
                            <span className="font-mono text-[9px] text-[#4B6858]">
                              {day.date.slice(5)}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Business Challenge Distribution */}
              <div className="lg:col-span-5 rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                  Business Challenge Distribution
                </p>
                {data.charts.challengeDistribution.length === 0 ? (
                  <p className="text-sm text-[#4B6858] py-8">
                    No AI questions, diagnostics, or enquiries recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const maxC = Math.max(
                        1,
                        ...data.charts.challengeDistribution.map((c) => c.count)
                      );
                      return data.charts.challengeDistribution.map((ch) => (
                        <div key={ch.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{ch.label}</span>
                            <span className="font-mono">{ch.count}</span>
                          </div>
                          <div className="h-2 rounded-full bg-[#E4EAE1]">
                            <div
                              className="h-full rounded-full bg-[#A47E3B]"
                              style={{
                                width: `${Math.round((ch.count / maxC) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. VISITORS */}
        {section === "visitors" && (
          <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 overflow-x-auto">
            {data.visitors.length === 0 ? (
              <p className="text-sm text-[#4B6858]">
                No anonymous sessions recorded yet.
              </p>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#12271E]/12 font-mono text-[10px] uppercase text-[#4B6858]">
                    <th className="pb-3 pr-4">Session</th>
                    <th className="pb-3 pr-4">First Visit</th>
                    <th className="pb-3 pr-4">Last Activity</th>
                    <th className="pb-3 pr-4">Branches</th>
                    <th className="pb-3 pr-4">Milestones</th>
                    <th className="pb-3 pr-4">AI</th>
                    <th className="pb-3 pr-4">Diagnostic</th>
                    <th className="pb-3">Contact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#12271E]/10">
                  {data.visitors.map((v) => (
                    <tr key={v.sessionId}>
                      <td className="py-3 pr-4 font-mono text-[11px]">
                        {v.sessionId.slice(0, 12)}…
                      </td>
                      <td className="py-3 pr-4 text-[#4B6858]">
                        {new Date(v.firstVisit).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-[#4B6858]">
                        {new Date(v.lastActivity).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        {v.branchesExplored.join(", ") || "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {v.milestonesOpened.join(", ") || "—"}
                      </td>
                      <td className="py-3 pr-4 font-mono">{v.aiInteractions}</td>
                      <td className="py-3 pr-4">
                        {v.diagnosticCompleted ? "Completed" : "—"}
                      </td>
                      <td className="py-3 font-mono">{v.contactActions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* 3. LIVE ACTIVITY */}
        {section === "activity" && (
          <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4B6858]">
                Auto-refreshing every 10s · Actual Stored Events
              </p>
            </div>
            {data.liveActivity.length === 0 ? (
              <p className="text-sm text-[#4B6858]">No activity recorded yet.</p>
            ) : (
              <ul className="divide-y divide-[#12271E]/10">
                {data.liveActivity.map((ev) => (
                  <li
                    key={ev.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
                  >
                    <div>
                      <span className="font-mono text-[11px] uppercase text-[#A47E3B] mr-2">
                        {ev.eventType.replace(/_/g, " ")}
                      </span>
                      <span className="text-[#12271E]">
                        {ev.targetLabel || ev.targetId || "Portfolio"}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#4B6858]">
                      {ev.sessionId.slice(0, 8)} ·{" "}
                      {new Date(ev.createdAt).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 4. AI STRATEGY ASSISTANT */}
        {section === "ai" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-[#12271E]/12 bg-[#FAF7F0] p-4">
                <p className="font-mono text-[10px] uppercase text-[#4B6858]">
                  Total AI Questions
                </p>
                <p className="font-serif text-3xl mt-1">
                  {data.aiStats.totalQuestions}
                </p>
              </div>
              <div className="rounded-xl border border-[#12271E]/12 bg-[#FAF7F0] p-4">
                <p className="font-mono text-[10px] uppercase text-[#4B6858]">
                  Unanswered Flags
                </p>
                <p className="font-serif text-3xl mt-1">
                  {data.aiStats.unansweredCount}
                </p>
              </div>
              <div className="rounded-xl border border-[#12271E]/12 bg-[#FAF7F0] p-4">
                <p className="font-mono text-[10px] uppercase text-[#4B6858]">
                  API Errors / Fallbacks
                </p>
                <p className="font-serif text-3xl mt-1">
                  {data.aiStats.errorCount}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                  Recent Anonymized AI Interactions
                </p>
                <button
                  type="button"
                  onClick={() => setSection("content")}
                  className="font-mono text-[10px] uppercase text-[#12271E] underline"
                >
                  Manage Knowledge Base →
                </button>
              </div>
              {data.aiStats.recentInteractions.length === 0 ? (
                <p className="text-sm text-[#4B6858]">
                  No AI questions recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-[#12271E]/10">
                  {data.aiStats.recentInteractions.map((ai) => (
                    <div key={ai.id} className="py-3 space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium text-sm text-[#12271E]">
                          {ai.question}
                        </p>
                        <span className="font-mono text-[10px] uppercase text-[#4B6858]">
                          {ai.status} · {ai.recommendedBranch || "—"} ·{" "}
                          {ai.modelUsed || "—"}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B6858]">
                        {ai.answerSummary}
                      </p>
                      {ai.errorMessage && (
                        <p className="font-mono text-[10px] text-[#9E3B2B]">
                          Error: {ai.errorMessage}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. BUSINESS DIAGNOSTICS */}
        {section === "diagnostics" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {["All", ...Array.from(new Set(data.diagnostics.map((d) => d.challengeCategory)))].map(
                (cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDiagFilter(cat)}
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase border ${
                      diagFilter === cat
                        ? "border-[#12271E] bg-[#12271E] text-[#F5F1E8]"
                        : "border-[#12271E]/20 bg-white text-[#4B6858]"
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>

            <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-4">
              {data.diagnostics.filter(
                (d) =>
                  diagFilter === "All" || d.challengeCategory === diagFilter
              ).length === 0 ? (
                <p className="text-sm text-[#4B6858]">
                  No completed diagnostics yet.
                </p>
              ) : (
                <div className="divide-y divide-[#12271E]/10">
                  {data.diagnostics
                    .filter(
                      (d) =>
                        diagFilter === "All" ||
                        d.challengeCategory === diagFilter
                    )
                    .map((d) => (
                      <div key={d.id} className="py-4 space-y-2">
                        <div className="flex flex-wrap justify-between gap-2">
                          <span className="font-serif text-xl text-[#12271E]">
                            {d.challengeCategory}
                          </span>
                          <span className="font-mono text-[10px] text-[#4B6858]">
                            {new Date(d.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-[#4B6858]">
                          {d.aiAnalysis}
                        </p>
                        {d.selectedAnswers.length > 0 && (
                          <p className="text-xs text-[#12271E]">
                            Answers: {d.selectedAnswers.join(" | ")}
                          </p>
                        )}
                        {d.businessDescription && (
                          <p className="text-xs italic text-[#4B6858]">
                            &ldquo;{d.businessDescription}&rdquo;
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. LEADS & ENQUIRIES CRM */}
        {section === "enquiries" && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="search"
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                placeholder="Search name, email, company, challenge..."
                className="w-full sm:w-72 rounded-xl border border-[#12271E]/20 bg-white px-3.5 py-2 text-xs"
              />
              <div className="flex flex-wrap gap-1.5">
                {(["All", ...ENQUIRY_STATUSES] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setLeadStatusFilter(st)}
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase border ${
                      leadStatusFilter === st
                        ? "border-[#12271E] bg-[#12271E] text-[#F5F1E8]"
                        : "border-[#12271E]/20 bg-white text-[#4B6858]"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {filteredEnquiries.length === 0 ? (
              <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 text-sm text-[#4B6858]">
                No enquiries match this filter.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEnquiries.map((lead) => (
                  <div
                    key={lead.id}
                    className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-5 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-serif text-2xl text-[#12271E]">
                          {lead.name}{" "}
                          {lead.company && (
                            <span className="text-base text-[#4B6858]">
                              · {lead.company}
                            </span>
                          )}
                        </p>
                        <p className="font-mono text-xs text-[#4B6858]">
                          {lead.email} · Branch: {lead.relevantBranch || "—"} ·
                          AI Class: {lead.aiClassification}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          aria-label={`Status for ${lead.name}`}
                          disabled={savingLeadId === lead.id}
                          value={lead.status}
                          onChange={(e) =>
                            void handleUpdateEnquiry(lead.id, {
                              status: e.target.value as EnquiryStatus,
                            })
                          }
                          className="rounded-lg border border-[#12271E]/20 bg-white px-2.5 py-1 font-mono text-[11px]"
                        >
                          {ENQUIRY_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <p className="text-sm text-[#12271E]">
                      <strong>Challenge:</strong> {lead.businessChallenge}
                    </p>
                    <p className="text-sm text-[#4B6858]">{lead.message}</p>

                    <div className="pt-2 border-t border-[#12271E]/10 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
                      <input
                        type="text"
                        defaultValue={lead.internalNotes}
                        placeholder="Add internal note and press Enter..."
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void handleUpdateEnquiry(lead.id, {
                              internalNotes: (e.target as HTMLInputElement).value,
                            });
                          }
                        }}
                        className="flex-1 rounded-lg border border-[#12271E]/15 bg-white px-3 py-1.5 text-xs"
                      />
                      <span className="font-mono text-[10px] text-[#4B6858]">
                        {new Date(lead.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. TREE ANALYTICS HEATMAP */}
        {section === "tree" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7 rounded-2xl border border-[#12271E]/12 bg-[#0B1C15] text-[#F5F1E8] p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A65B]">
                  Living Strategy Tree Heatmap
                </p>
                <span className="font-mono text-[10px] text-[#9CB5A5]">
                  Intensity = Real Interaction Volume
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-2">
                {data.treeHeatmap.branches.map((b) => {
                  const ratio = b.clicks / maxBranchClicks;
                  const active = selectedHeatBranch === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedHeatBranch(b.id)}
                      style={{
                        backgroundColor: `rgba(57, 201, 133, ${
                          0.12 + ratio * 0.45
                        })`,
                      }}
                      className={`rounded-xl border p-4 text-left transition-all ${
                        active ? "border-[#C9A65B]" : "border-[#9CB5A5]/25"
                      }`}
                    >
                      <p className="font-serif text-xl text-[#F5F1E8]">
                        {b.label}
                      </p>
                      <p className="font-mono text-xs text-[#C9A65B] mt-1">
                        {b.clicks} clicks
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-3 border-t border-[#9CB5A5]/15 text-xs">
                <div>
                  <p className="font-mono text-[9.5px] uppercase text-[#9CB5A5]">
                    Roots Hits
                  </p>
                  <p className="font-serif text-xl">
                    {data.treeHeatmap.roots.reduce((a, r) => a + r.count, 0)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9.5px] uppercase text-[#9CB5A5]">
                    Leaves Opened
                  </p>
                  <p className="font-serif text-xl">
                    {data.treeHeatmap.leaves.reduce((a, r) => a + r.count, 0)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9.5px] uppercase text-[#9CB5A5]">
                    Fruits Viewed
                  </p>
                  <p className="font-serif text-xl">
                    {data.treeHeatmap.fruits.reduce((a, r) => a + r.count, 0)}
                  </p>
                </div>
                <div>
                  <p className="font-mono text-[9.5px] uppercase text-[#9CB5A5]">
                    Seeds Viewed
                  </p>
                  <p className="font-serif text-xl">
                    {data.treeHeatmap.seeds.reduce((a, r) => a + r.count, 0)}
                  </p>
                </div>
              </div>
            </div>

            {currentHeatBranch && (
              <div className="lg:col-span-5 rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                  Branch Deep Dive
                </p>
                <h2 className="font-serif text-3xl text-[#12271E]">
                  {currentHeatBranch.label}
                </h2>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-white p-3 border border-[#12271E]/10">
                    <p className="font-mono text-[10px] text-[#4B6858]">
                      Total Clicks
                    </p>
                    <p className="font-serif text-2xl">
                      {currentHeatBranch.clicks}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-[#12271E]/10">
                    <p className="font-mono text-[10px] text-[#4B6858]">
                      Unique Sessions
                    </p>
                    <p className="font-serif text-2xl">
                      {currentHeatBranch.uniqueSessions}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-[#12271E]/10">
                    <p className="font-mono text-[10px] text-[#4B6858]">
                      AI Recommendations
                    </p>
                    <p className="font-serif text-2xl">
                      {currentHeatBranch.aiRecommendations}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white p-3 border border-[#12271E]/10">
                    <p className="font-mono text-[10px] text-[#4B6858]">
                      Contact Conversions
                    </p>
                    <p className="font-serif text-2xl">
                      {currentHeatBranch.contactConversions}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. CAREER MANAGEMENT CMS */}
        {section === "career" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <form
              onSubmit={handleAddMilestone}
              className="lg:col-span-5 rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-3 h-fit"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                Add Career Milestone
              </p>
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="Company name"
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newChapter}
                onChange={(e) => setNewChapter(e.target.value)}
                placeholder="Chapter label"
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newSpan}
                onChange={(e) => setNewSpan(e.target.value)}
                placeholder="Dates (e.g. Jan 2026 – Present)"
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <input
                type="text"
                value={newRoleTitle}
                onChange={(e) => setNewRoleTitle(e.target.value)}
                placeholder="Role title"
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <textarea
                rows={2}
                value={newHighlight}
                onChange={(e) => setNewHighlight(e.target.value)}
                placeholder="Verified highlight or achievement"
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTrack}
                  onChange={(e) =>
                    setNewTrack(e.target.value as "chronological" | "parallel")
                  }
                  className="rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-xs"
                >
                  <option value="chronological">Core Path</option>
                  <option value="parallel">Parallel Advisory</option>
                </select>
                <select
                  value={newBranchId}
                  onChange={(e) =>
                    setNewBranchId(e.target.value as StrategyBranch["id"])
                  }
                  className="rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-xs"
                >
                  {data.cms.branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[#12271E] py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F5F1E8]"
              >
                Publish Milestone
              </button>
            </form>

            <div className="lg:col-span-7 rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                Live Milestones ({data.cms.milestones.length})
              </p>
              <div className="divide-y divide-[#12271E]/10">
                {data.cms.milestones.map((m) => (
                  <div
                    key={m.id}
                    className="py-3 flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-serif text-xl text-[#12271E]">
                        {m.company}
                      </p>
                      <p className="font-mono text-[10px] text-[#4B6858]">
                        {m.overallSpan} · {m.published ? "Published" : "Draft"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void handleToggleMilestonePublish(m.id, !m.published)
                        }
                        className="rounded-full border border-[#12271E]/20 px-3 py-1 font-mono text-[10px] uppercase"
                      >
                        {m.published ? "Unpublish" : "Publish"}
                      </button>
                      {confirmDeleteId === m.id ? (
                        <button
                          type="button"
                          onClick={() => void handleDeleteMilestone(m.id)}
                          className="rounded-full bg-[#9E3B2B] px-3 py-1 font-mono text-[10px] uppercase text-white"
                        >
                          Confirm Delete
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(m.id)}
                          aria-label={`Delete ${m.company}`}
                          className="p-1.5 text-[#9E3B2B]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 9. CONTENT & AI KNOWLEDGE BASE MANAGEMENT */}
        {section === "content" && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <form
              onSubmit={handleAddKnowledge}
              className="lg:col-span-5 rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-3 h-fit"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                Add AI Knowledge Entry
              </p>
              <input
                type="text"
                required
                value={kbTitle}
                onChange={(e) => setKbTitle(e.target.value)}
                placeholder="Entry title"
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <select
                value={kbCategory}
                onChange={(e) =>
                  setKbCategory(
                    e.target.value as
                      | "biography"
                      | "career"
                      | "expertise"
                      | "achievement"
                      | "insight"
                      | "faq"
                  )
                }
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-xs"
              >
                <option value="biography">Biography</option>
                <option value="career">Career History</option>
                <option value="expertise">Expertise</option>
                <option value="achievement">Verified Achievement</option>
                <option value="insight">Published Insight</option>
                <option value="faq">FAQ</option>
              </select>
              <textarea
                rows={4}
                required
                value={kbContent}
                onChange={(e) => setKbContent(e.target.value)}
                placeholder="Verified factual content used by Ask Sonia's Strategy Tree..."
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-full bg-[#12271E] py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F5F1E8]"
              >
                Save &amp; Index Knowledge
              </button>
            </form>

            <div className="lg:col-span-7 space-y-4">
              <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                  Published AI Knowledge Base ({data.cms.knowledge.length})
                </p>
                <div className="divide-y divide-[#12271E]/10">
                  {data.cms.knowledge.map((k) => (
                    <div key={k.id} className="py-3 space-y-1">
                      <p className="font-mono text-[10px] uppercase text-[#A47E3B]">
                        {k.category} · {k.published ? "Indexed" : "Hidden"}
                      </p>
                      <p className="font-serif text-lg text-[#12271E]">
                        {k.title}
                      </p>
                      <p className="text-xs text-[#4B6858]">{k.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-2">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#4B6858]">
                  Recent Content Revisions
                </p>
                {data.cms.revisions.length === 0 ? (
                  <p className="text-xs text-[#4B6858]">
                    No CMS edits logged yet.
                  </p>
                ) : (
                  <ul className="space-y-1 text-xs text-[#4B6858]">
                    {data.cms.revisions.slice(0, 8).map((r) => (
                      <li key={r.id}>
                        {r.summary} · {new Date(r.createdAt).toLocaleString()}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 10. AI INSIGHTS */}
        {section === "insights" && (
          <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
                  Executive Interpretation Engine
                </p>
                <p className="text-xs text-[#4B6858] mt-1">
                  Analyzes aggregated, non-personal telemetry only.
                </p>
              </div>
              <button
                type="button"
                disabled={loadingInsights}
                onClick={() => void handleGenerateInsights()}
                className="inline-flex items-center gap-2 rounded-full bg-[#12271E] px-5 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#F5F1E8]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C9A65B]" />
                <span>
                  {loadingInsights ? "Analyzing..." : "Generate Insights"}
                </span>
              </button>
            </div>

            {insightsData && (
              <div className="space-y-3 border-t border-[#12271E]/12 pt-4">
                <ul className="space-y-2">
                  {insightsData.insights.map((ins) => (
                    <li
                      key={ins}
                      className="rounded-xl border border-[#12271E]/12 bg-white p-4 text-sm text-[#12271E]"
                    >
                      {ins}
                    </li>
                  ))}
                </ul>
                <p className="font-mono text-[10px] text-[#4B6858]">
                  {insightsData.disclaimer}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 11. SETTINGS */}
        {section === "settings" && (
          <div className="rounded-2xl border border-[#12271E]/12 bg-[#FAF7F0] p-6 space-y-5 max-w-2xl">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#A47E3B]">
              Portal &amp; Privacy Configuration
            </p>

            <label className="flex items-center justify-between gap-4 border-b border-[#12271E]/10 pb-4">
              <span className="text-sm text-[#12271E]">
                Enable &ldquo;Ask Sonia&apos;s Strategy Tree&rdquo; AI Assistant
              </span>
              <input
                type="checkbox"
                checked={Boolean(data.settings?.aiAssistantEnabled ?? true)}
                onChange={async (e) => {
                  await fetch("/api/admin/cms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      entity: "settings",
                      data: { aiAssistantEnabled: e.target.checked },
                    }),
                  });
                  setSettingsMsg("Settings saved.");
                  await fetchDashboard(range);
                }}
                className="accent-[#12271E]"
              />
            </label>

            <div className="space-y-1.5">
              <label className="block font-mono text-[10px] uppercase text-[#4B6858]">
                Public Telemetry Privacy Notice
              </label>
              <textarea
                rows={3}
                defaultValue={data.settings?.privacyNotice ?? ""}
                onBlur={async (e) => {
                  await fetch("/api/admin/cms", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      entity: "settings",
                      data: { privacyNotice: e.target.value },
                    }),
                  });
                  setSettingsMsg("Privacy notice updated.");
                  await fetchDashboard(range);
                }}
                className="w-full rounded-lg border border-[#12271E]/20 bg-white px-3 py-2 text-xs"
              />
            </div>

            {settingsMsg && (
              <p className="font-mono text-[11px] text-[#12271E]">
                {settingsMsg}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

