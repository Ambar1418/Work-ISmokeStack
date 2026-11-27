"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  BrainCircuit,
  Briefcase,
  Compass,
  Mail,
  Sparkles,
  Sprout,
  User,
  X,
} from "lucide-react";
import {
  DIAGNOSTIC_PROMPTS,
  IMPACT_FRUITS,
  ROOTS_DATA,
  SEEDS_DATA,
  SONIA_IDENTITY,
  TRUNK_PILLARS,
  type StrategyBranch,
} from "@/data/soniaData";
import type { CmsBranchRecord, CmsMilestoneRecord } from "@/lib/db";
import { getAnonymousSessionId, trackEngagement } from "@/lib/tracker";
import { AskStrategyAiPanel } from "./AskStrategyAiPanel";
import { ConnectLeafPanel } from "./ConnectLeafPanel";

type LeafWorkspaceTab =
  | "about"
  | "journey"
  | "impact"
  | "ai"
  | "diagnostic"
  | "seeds"
  | "connect";

interface LivingStrategyHomeProps {
  initialBranches: CmsBranchRecord[];
  initialMilestones: CmsMilestoneRecord[];
  privacyNotice: string;
}

interface PortalLeafNode {
  tab: LeafWorkspaceTab;
  label: string;
  sublabel: string;
  x: number;
  y: number;
  leafAngle: number;
  labelDx: number;
  labelDy: number;
  anchor: "start" | "end" | "middle";
  boughPath: string;
}

const PORTAL_LEAVES: PortalLeafNode[] = [
  {
    tab: "about",
    label: "About & Roots",
    sublabel: "Philosophy",
    x: 146,
    y: 268,
    leafAngle: -52,
    labelDx: -28,
    labelDy: -18,
    anchor: "end",
    boughPath: "M 380 398 C 288 358 214 316 146 268",
  },
  {
    tab: "journey",
    label: "Career Journey",
    sublabel: "2006 – Present",
    x: 186,
    y: 128,
    leafAngle: -32,
    labelDx: -26,
    labelDy: -18,
    anchor: "end",
    boughPath: "M 380 318 C 304 252 242 186 186 128",
  },
  {
    tab: "ai",
    label: "Ask AI Tree",
    sublabel: "Strategy Guide",
    x: 380,
    y: 74,
    leafAngle: 0,
    labelDx: 0,
    labelDy: -34,
    anchor: "middle",
    boughPath: "M 380 245 C 380 182 380 128 380 74",
  },
  {
    tab: "impact",
    label: "Impact Fruits",
    sublabel: "Case Studies",
    x: 574,
    y: 128,
    leafAngle: 32,
    labelDx: 26,
    labelDy: -18,
    anchor: "start",
    boughPath: "M 380 318 C 456 252 518 186 574 128",
  },
  {
    tab: "seeds",
    label: "Advisory & Seeds",
    sublabel: "Consultancy",
    x: 592,
    y: 268,
    leafAngle: 52,
    labelDx: 26,
    labelDy: -18,
    anchor: "start",
    boughPath: "M 380 398 C 464 358 532 316 592 268",
  },
  {
    tab: "connect",
    label: "Connect",
    sublabel: "Contact & Brief",
    x: 526,
    y: 368,
    leafAngle: 64,
    labelDx: 28,
    labelDy: 10,
    anchor: "start",
    boughPath: "M 380 424 C 438 404 484 388 526 368",
  },
];

const BRANCH_ANCHORS: Array<{
  id: StrategyBranch["id"];
  x: number;
  y: number;
}> = [
  { id: "product", x: 268, y: 332 },
  { id: "brand", x: 286, y: 218 },
  { id: "operations", x: 274, y: 396 },
  { id: "marketing", x: 474, y: 218 },
  { id: "revenue", x: 492, y: 332 },
  { id: "people", x: 446, y: 404 },
];

export function LivingStrategyHome({
  initialBranches,
  initialMilestones,
  privacyNotice,
}: LivingStrategyHomeProps) {
  const prefersReducedMotion = useReducedMotion();
  const [branches, setBranches] = useState<CmsBranchRecord[]>(initialBranches);
  const [milestones, setMilestones] =
    useState<CmsMilestoneRecord[]>(initialMilestones);
  const [livePrivacyNotice, setLivePrivacyNotice] = useState(privacyNotice);

  const [activeTab, setActiveTab] = useState<LeafWorkspaceTab | null>(null);
  const [selectedRootId, setSelectedRootId] = useState<string>(ROOTS_DATA[0].id);
  const [highlightedBranch, setHighlightedBranch] =
    useState<StrategyBranch["id"]>("brand");
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(
    initialMilestones[0]?.id ?? "showmeleads"
  );
  const [selectedFruitId, setSelectedFruitId] = useState<string>(
    IMPACT_FRUITS[0].id
  );
  const [preselectedChallenge, setPreselectedChallenge] = useState<
    string | undefined
  >(undefined);

  const [diagPromptId, setDiagPromptId] = useState<string>(
    DIAGNOSTIC_PROMPTS[0].id
  );
  const [diagAnswers, setDiagAnswers] = useState<string[]>([]);
  const [diagDesc, setDiagDesc] = useState("");
  const [diagResult, setDiagResult] = useState<{
    analysis: string;
    actions: string[];
    branchId: StrategyBranch["id"];
  } | null>(null);
  const [diagSaving, setDiagSaving] = useState(false);
  const [consentDismissed, setConsentDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    void fetch("/api/portfolio", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            ok?: boolean;
            branches?: CmsBranchRecord[];
            milestones?: CmsMilestoneRecord[];
            settings?: { privacyNotice?: string };
          } | null
        ) => {
          if (!active || !data?.ok) return;
          if (Array.isArray(data.branches) && data.branches.length > 0) {
            setBranches(data.branches);
          }
          if (Array.isArray(data.milestones) && data.milestones.length > 0) {
            setMilestones(data.milestones);
          }
          if (data.settings?.privacyNotice) {
            setLivePrivacyNotice(data.settings.privacyNotice);
          }
        }
      )
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveTab(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const openLeafTab = (tab: LeafWorkspaceTab) => {
    setActiveTab(tab);
    if (tab === "ai") {
      trackEngagement("ai_opened", "leaf-ai", "Ask Sonia's Strategy Tree");
    } else if (tab === "diagnostic") {
      trackEngagement("diagnostic_started", "leaf-diagnostic", "Diagnostic");
    } else if (tab === "connect") {
      trackEngagement("contact_clicked", "leaf-connect", "Connect Leaf");
    } else if (tab === "seeds") {
      trackEngagement("seed_opened", "leaf-seeds", "Advisory & Seeds");
    } else if (tab === "impact") {
      trackEngagement("case_study_opened", selectedFruitId, "Impact Fruits");
    } else if (tab === "about") {
      trackEngagement("root_selected", selectedRootId, "About & Roots");
    }
  };

  const handleSelectBranch = (branchId: StrategyBranch["id"]) => {
    setHighlightedBranch(branchId);
    const branch = branches.find((b) => b.id === branchId);
    trackEngagement("branch_selected", branchId, branch?.label ?? branchId);
    const firstMs = milestones.find((m) => m.branchIds.includes(branchId));
    if (firstMs) setSelectedMilestoneId(firstMs.id);
    setActiveTab("journey");
  };

  const handleOpenMilestone = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    const m = milestones.find((item) => item.id === milestoneId);
    if (m?.branchIds[0]) setHighlightedBranch(m.branchIds[0]);
    trackEngagement("milestone_opened", milestoneId, m?.company ?? milestoneId);
    setActiveTab("journey");
  };

  const handleRunDiagnostic = async () => {
    if (diagSaving) return;
    setDiagSaving(true);
    const option =
      DIAGNOSTIC_PROMPTS.find((p) => p.id === diagPromptId) ??
      DIAGNOSTIC_PROMPTS[0];

    try {
      const res = await fetch("/api/diagnostics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptId: option.id,
          sessionId: getAnonymousSessionId(),
          selectedAnswers: diagAnswers,
          businessDescription: diagDesc.trim() || undefined,
        }),
      });
      const json = (await res.json()) as {
        diagnostic?: { aiAnalysis: string; recommendedActions: string[] };
      };
      setHighlightedBranch(option.branchId);
      setDiagResult({
        analysis:
          json.diagnostic?.aiAnalysis ||
          `Mapped to Sonia's ${option.branchId} branch.`,
        actions:
          json.diagnostic?.recommendedActions ?? option.recommendedActions,
        branchId: option.branchId,
      });
    } finally {
      setDiagSaving(false);
    }
  };

  const activeRoot =
    ROOTS_DATA.find((r) => r.id === selectedRootId) ?? ROOTS_DATA[0];

  const activeMilestone = useMemo(
    () =>
      milestones.find((m) => m.id === selectedMilestoneId) ?? milestones[0],
    [milestones, selectedMilestoneId]
  );

  const activeFruit = useMemo(
    () =>
      IMPACT_FRUITS.find((f) => f.id === selectedFruitId) ?? IMPACT_FRUITS[0],
    [selectedFruitId]
  );

  return (
    <div className="relative min-h-screen flex flex-col justify-between px-4 py-5 sm:px-8 sm:py-7">
      {/* Dark Home Top Bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-[#39C985] shadow-[0_0_10px_#39C985]" />
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#9CB5A5]">
            Sonia Specialist
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={() => openLeafTab("ai")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#C9A65B]/50 bg-[#0E2219] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F4EFE4] transition-colors hover:border-[#C9A65B]"
          >
            <BrainCircuit className="h-3.5 w-3.5 text-[#C9A65B]" />
            <span>Ask AI Tree</span>
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-full border border-[#9CB5A5]/30 bg-[#0E2219]/70 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#F4EFE4] transition-colors hover:border-[#C9A65B] hover:text-[#C9A65B]"
          >
            <span>Admin</span>
            <ArrowUpRight className="h-3 w-3" />
          </Link>

          {SONIA_IDENTITY.linkedinUrl && (
            <a
              href={SONIA_IDENTITY.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEngagement(
                  "linkedin_clicked",
                  "header-linkedin",
                  "Header LinkedIn"
                )
              }
              className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#9CB5A5]/25 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#9CB5A5] hover:border-[#9CB5A5] hover:text-[#F4EFE4]"
            >
              <span>LinkedIn</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      </header>

      {/* SINGLE CREATIVE DARK TREE HOME */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center py-6">
        <div className="text-center max-w-xl mb-4 sm:mb-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-[#C9A65B]">
            {SONIA_IDENTITY.title}
          </p>
          <h1 className="mt-1.5 font-serif text-4xl sm:text-6xl font-light tracking-[0.08em] text-[#F4EFE4]">
            {SONIA_IDENTITY.name}
          </h1>
          <p className="mt-2 font-serif text-lg sm:text-xl italic text-[#9CB5A5]">
            &ldquo;{SONIA_IDENTITY.mainStatement}&rdquo;
          </p>
        </div>

        {/* DESKTOP TREE SVG */}
        <div className="hidden md:block w-full max-w-3xl">
          <svg
            viewBox="0 0 760 555"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto overflow-visible"
            role="img"
            aria-label="Living Strategy Tree"
          >
            <circle
              cx="380"
              cy="255"
              r="210"
              stroke="#9CB5A5"
              strokeOpacity="0.1"
              strokeDasharray="3 7"
            />
            <line
              x1="120"
              y1="448"
              x2="640"
              y2="448"
              stroke="#9CB5A5"
              strokeOpacity="0.22"
              strokeDasharray="4 6"
            />

            {ROOTS_DATA.map((root, i) => {
              const xEnd = 140 + i * 96;
              const pathD = `M 380 448 C ${380 + (xEnd - 380) * 0.45} 478 ${xEnd} 496 ${xEnd} 518`;
              return (
                <g
                  key={root.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Root: ${root.title}`}
                  onClick={() => {
                    setSelectedRootId(root.id);
                    openLeafTab("about");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedRootId(root.id);
                      openLeafTab("about");
                    }
                  }}
                  className="cursor-pointer focus:outline-none group"
                >
                  <path
                    d={pathD}
                    stroke="#39C985"
                    strokeOpacity="0.4"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={xEnd}
                    cy={518}
                    r="3.2"
                    fill="#0C1D16"
                    stroke="#9CB5A5"
                    strokeWidth="1.3"
                  />
                  <text
                    x={xEnd}
                    y={536}
                    textAnchor="middle"
                    className="fill-[#7F9B8B] font-mono text-[9.5px] uppercase tracking-[0.14em] group-hover:fill-[#C9A65B]"
                  >
                    {root.title}
                  </text>
                </g>
              );
            })}

            <g
              tabIndex={0}
              role="button"
              aria-label="Trunk"
              onClick={() => openLeafTab("about")}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openLeafTab("about");
                }
              }}
              className="cursor-pointer focus:outline-none"
            >
              <motion.path
                d="M 380 448 C 377 372 383 300 380 232"
                stroke="#39C985"
                strokeWidth="4.5"
                strokeLinecap="round"
                initial={prefersReducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9 }}
              />
              <path
                d="M 372 446 C 371 376 375 305 375 245"
                stroke="#9CB5A5"
                strokeOpacity="0.32"
                strokeWidth="1.1"
              />
              <path
                d="M 388 446 C 389 376 385 305 385 245"
                stroke="#9CB5A5"
                strokeOpacity="0.32"
                strokeWidth="1.1"
              />
            </g>

            {PORTAL_LEAVES.map((leaf, idx) => {
              const isLeafActive = activeTab === leaf.tab;
              return (
                <g key={leaf.tab}>
                  <motion.path
                    d={leaf.boughPath}
                    stroke={isLeafActive ? "#C9A65B" : "#39C985"}
                    strokeOpacity={isLeafActive ? 0.95 : 0.45}
                    strokeWidth={isLeafActive ? 2.6 : 1.7}
                    strokeLinecap="round"
                    initial={prefersReducedMotion ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.85, delay: 0.15 + idx * 0.06 }}
                  />

                  {/* Sculpted Botanical Leaf Silhouette + Crisp Editorial Label */}
                  <g
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${leaf.label}`}
                    onClick={() => openLeafTab(leaf.tab)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        openLeafTab(leaf.tab);
                      }
                    }}
                    className="cursor-pointer focus:outline-none group"
                  >
                    <g
                      transform={`translate(${leaf.x}, ${leaf.y}) rotate(${leaf.leafAngle})`}
                    >
                      {/* Outer aura */}
                      <circle
                        cx="0"
                        cy="0"
                        r={isLeafActive ? 26 : 20}
                        fill={isLeafActive ? "#C9A65B" : "#39C985"}
                        fillOpacity={isLeafActive ? 0.18 : 0.08}
                        className="transition-all duration-300"
                      />
                      {/* Hand-drawn Botanical Leaf Blade */}
                      <path
                        d="M 0 -22 C 13 -10 13 10 0 22 C -13 10 -13 -10 0 -22 Z"
                        fill={isLeafActive ? "#234937" : "#11281E"}
                        stroke={isLeafActive ? "#C9A65B" : "#39C985"}
                        strokeWidth={isLeafActive ? 2 : 1.5}
                      />
                      {/* Central Leaf Midrib & Veins */}
                      <line
                        x1="0"
                        y1="-17"
                        x2="0"
                        y2="17"
                        stroke={isLeafActive ? "#C9A65B" : "#9CB5A5"}
                        strokeOpacity="0.65"
                        strokeWidth="1"
                      />
                      <path
                        d="M 0 -4 L -6 -9 M 0 -4 L 6 -9 M 0 5 L -6 0 M 0 5 L 6 0"
                        stroke={isLeafActive ? "#C9A65B" : "#9CB5A5"}
                        strokeOpacity="0.45"
                        strokeWidth="0.9"
                      />
                    </g>

                    <text
                      x={leaf.x + leaf.labelDx}
                      y={leaf.y + leaf.labelDy}
                      textAnchor={leaf.anchor}
                      className={`font-serif text-[18px] transition-colors ${
                        isLeafActive
                          ? "fill-[#C9A65B] font-medium"
                          : "fill-[#F4EFE4] group-hover:fill-[#C9A65B]"
                      }`}
                    >
                      {leaf.label}
                    </text>
                    <text
                      x={leaf.x + leaf.labelDx}
                      y={leaf.y + leaf.labelDy + 14}
                      textAnchor={leaf.anchor}
                      className="fill-[#9CB5A5] font-mono text-[9.5px] uppercase tracking-[0.14em]"
                    >
                      {leaf.sublabel}
                    </text>
                  </g>
                </g>
              );
            })}

            {BRANCH_ANCHORS.map((anchor) => {
              const branch = branches.find((b) => b.id === anchor.id);
              if (!branch) return null;
              const isHighlighted = highlightedBranch === branch.id;
              return (
                <g
                  key={branch.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Explore ${branch.label}`}
                  onClick={() => handleSelectBranch(branch.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectBranch(branch.id);
                    }
                  }}
                  className="cursor-pointer focus:outline-none group"
                >
                  <circle
                    cx={anchor.x}
                    cy={anchor.y}
                    r={isHighlighted ? 16 : 11}
                    fill={isHighlighted ? "#C9A65B" : "#39C985"}
                    fillOpacity={isHighlighted ? 0.25 : 0.1}
                  />
                  <circle
                    cx={anchor.x}
                    cy={anchor.y}
                    r={isHighlighted ? 5.5 : 4}
                    fill={isHighlighted ? "#C9A65B" : "#0C1D16"}
                    stroke={isHighlighted ? "#F4EFE4" : "#39C985"}
                    strokeWidth="1.5"
                  />
                  <text
                    x={anchor.x}
                    y={anchor.y + 20}
                    textAnchor="middle"
                    className={`font-mono text-[10px] uppercase tracking-[0.14em] ${
                      isHighlighted
                        ? "fill-[#C9A65B] font-medium"
                        : "fill-[#9CB5A5] group-hover:fill-[#F4EFE4]"
                    }`}
                  >
                    {branch.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* MOBILE LEAVES */}
        <div className="md:hidden w-full max-w-md space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-2.5">
            {PORTAL_LEAVES.map((leaf) => (
              <button
                key={leaf.tab}
                type="button"
                onClick={() => openLeafTab(leaf.tab)}
                className="rounded-2xl border border-[#39C985]/45 bg-[#11281E] px-4 py-3.5 text-left"
              >
                <p className="font-serif text-lg text-[#F4EFE4]">{leaf.label}</p>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[#9CB5A5] mt-0.5">
                  {leaf.sublabel}
                </p>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Minimal Bottom Bar */}
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-[#9CB5A5]/14 pt-4 text-[10px] font-mono uppercase tracking-[0.16em] text-[#9CB5A5]">
        <div className="flex flex-wrap items-center gap-3">
          <span>Click any leaf to open</span>
          {!consentDismissed && (
            <button
              type="button"
              onClick={() => setConsentDismissed(true)}
              title={livePrivacyNotice}
              className="rounded-full border border-[#9CB5A5]/25 px-2.5 py-0.5 text-[9px] text-[#9CB5A5] hover:text-[#F4EFE4]"
            >
              Anonymous Telemetry · Dismiss
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => openLeafTab("diagnostic")}
            className="text-[#C9A65B] hover:underline"
          >
            Diagnostic
          </button>
          <Link href="/admin" className="hover:text-[#F4EFE4]">
            Admin (/admin) ↗
          </Link>
        </div>
      </footer>

      {/* CLEAN WHITE LEAF DASHBOARD WORKSPACE */}
      <AnimatePresence>
        {activeTab && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-3 sm:p-6 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Leaf Workspace"
          >
            <motion.div
              initial={
                prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.99 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.2 }}
              className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white text-[#12271E] shadow-2xl md:flex-row"
            >
              {/* Crisp Evergreen Sidebar */}
              <aside className="flex shrink-0 flex-row gap-1.5 overflow-x-auto bg-[#0B1C15] p-3 text-[#F4EFE4] md:w-56 md:flex-col md:p-5">
                <div className="hidden md:block pb-4 mb-2 border-b border-white/10">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-[#C9A65B]">
                    Leaf View
                  </p>
                  <p className="font-serif text-xl text-white mt-0.5">
                    Sonia Specialist
                  </p>
                </div>

                {(
                  [
                    { id: "about", label: "About & Roots", icon: User },
                    { id: "journey", label: "Career Journey", icon: Briefcase },
                    { id: "impact", label: "Impact Fruits", icon: Sparkles },
                    { id: "ai", label: "Ask AI Tree", icon: BrainCircuit },
                    { id: "diagnostic", label: "Diagnostic", icon: Compass },
                    { id: "seeds", label: "Advisory & Seeds", icon: Sprout },
                    { id: "connect", label: "Connect", icon: Mail },
                  ] as Array<{
                    id: LeafWorkspaceTab;
                    label: string;
                    icon: typeof User;
                  }>
                ).map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openLeafTab(item.id)}
                      className={`inline-flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs transition-colors ${
                        active
                          ? "bg-white text-[#12271E] font-medium"
                          : "text-[#9CB5A5] hover:bg-[#142F23] hover:text-white"
                      }`}
                    >
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          active ? "text-[#12271E]" : "text-[#C9A65B]"
                        }`}
                      />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </aside>

              {/* CLEAN WHITE CONTENT AREA (Minimal, High-Contrast, Spacious) */}
              <div className="relative flex-1 overflow-y-auto bg-white p-6 sm:p-8 text-[#12271E]">
                <button
                  type="button"
                  onClick={() => setActiveTab(null)}
                  aria-label="Close leaf view"
                  className="absolute right-4 top-4 rounded-full border border-neutral-200 bg-white p-2 text-neutral-500 hover:border-[#12271E] hover:text-[#12271E]"
                >
                  <X className="h-4 w-4" />
                </button>

                {activeTab === "about" && (
                  <div className="space-y-6 pr-8 max-w-2xl">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
                        About &amp; Roots
                      </p>
                      <h2 className="font-serif text-3xl text-[#12271E] mt-1">
                        Different businesses. One consistent approach.
                      </h2>
                      <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
                        {SONIA_IDENTITY.supportingLine}
                      </p>
                    </div>

                    {/* Interactive Single-Root Focus (No wall of 6 cards!) */}
                    <div className="space-y-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">
                        Select a Root Principle
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {ROOTS_DATA.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              setSelectedRootId(r.id);
                              trackEngagement("root_selected", r.id, r.title);
                            }}
                            className={`rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase border transition-colors ${
                              activeRoot.id === r.id
                                ? "border-[#12271E] bg-[#12271E] text-white"
                                : "border-neutral-200 bg-[#FAF9F6] text-neutral-700 hover:border-neutral-400"
                            }`}
                          >
                            {r.code} · {r.title}
                          </button>
                        ))}
                      </div>

                      <div className="rounded-xl border border-neutral-200 bg-[#FAF9F6] p-5">
                        <p className="font-serif text-2xl italic text-[#12271E]">
                          &ldquo;{activeRoot.quote}&rdquo;
                        </p>
                        <p className="mt-2 text-sm text-neutral-600">
                          {activeRoot.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Clean Trunk Summary Strip */}
                    <div className="border-t border-neutral-200 pt-5">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500 mb-2.5">
                        Trunk Core
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {TRUNK_PILLARS.map((tp) => (
                          <div
                            key={tp.id}
                            className="rounded-xl border border-neutral-200 bg-white p-3"
                          >
                            <p className="font-serif text-lg text-[#12271E]">
                              {tp.label}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                              {tp.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "journey" && (
                  <div className="space-y-5 pr-8">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
                        Career Journey · 2006 – Present
                      </p>
                      <h2 className="font-serif text-3xl text-[#12271E] mt-1">
                        Selected Branches &amp; Milestones
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {branches.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          onClick={() => handleSelectBranch(b.id)}
                          className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase border ${
                            highlightedBranch === b.id
                              ? "border-[#12271E] bg-[#12271E] text-white"
                              : "border-neutral-200 bg-[#FAF9F6] text-neutral-600 hover:border-neutral-400"
                          }`}
                        >
                          {b.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
                      <div className="lg:col-span-5 space-y-1.5 max-h-[340px] overflow-y-auto pr-1">
                        {milestones.map((m) => {
                          const matchesBranch =
                            m.branchIds.includes(highlightedBranch);
                          const isSelected = m.id === activeMilestone?.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleOpenMilestone(m.id)}
                              className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                                isSelected
                                  ? "border-[#12271E] bg-[#12271E] text-white"
                                  : matchesBranch
                                    ? "border-neutral-300 bg-[#FAF9F6] text-[#12271E]"
                                    : "border-neutral-200 bg-white text-neutral-500 opacity-75"
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-serif text-lg">
                                  {m.company}
                                </span>
                                <span className="font-mono text-[9.5px] opacity-75">
                                  {m.track === "parallel" ? "Advisory" : "Core"}
                                </span>
                              </div>
                              <p className="font-mono text-[10px] opacity-75">
                                {m.overallSpan}
                              </p>
                            </button>
                          );
                        })}
                      </div>

                      {activeMilestone && (
                        <div className="lg:col-span-7 rounded-2xl border border-neutral-200 bg-[#FAF9F6] p-5 space-y-4">
                          <div>
                            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A47E3B]">
                              {activeMilestone.chapterLabel}
                            </p>
                            <h3 className="font-serif text-3xl text-[#12271E] mt-1">
                              {activeMilestone.company}
                            </h3>
                            <p className="font-mono text-xs text-neutral-500">
                              {activeMilestone.overallSpan}
                            </p>
                          </div>

                          <div className="space-y-1.5 border-l-2 border-[#12271E]/25 pl-3">
                            {activeMilestone.roles.map((r) => (
                              <div key={`${r.title}-${r.period}`}>
                                <p className="text-sm font-medium text-[#12271E]">
                                  {r.title}
                                </p>
                                <p className="font-mono text-[11px] text-neutral-500">
                                  {r.period}
                                </p>
                              </div>
                            ))}
                          </div>

                          <ul className="space-y-1.5 text-sm text-neutral-700">
                            {activeMilestone.highlights.map((h) => (
                              <li key={h} className="flex items-start gap-2">
                                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#12271E]" />
                                <span>{h}</span>
                              </li>
                            ))}
                          </ul>

                          {activeMilestone.fruitOutcome && (
                            <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 p-3">
                              <p className="font-mono text-[10px] uppercase text-[#A47E3B]">
                                Key Outcome
                              </p>
                              <p className="text-sm text-[#12271E] mt-0.5">
                                {activeMilestone.fruitOutcome}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "impact" && (
                  <div className="space-y-5 pr-8 max-w-2xl">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
                        Impact Fruits
                      </p>
                      <h2 className="font-serif text-3xl text-[#12271E] mt-1">
                        Documented Outcomes
                      </h2>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {IMPACT_FRUITS.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => {
                            setSelectedFruitId(f.id);
                            trackEngagement(
                              "case_study_opened",
                              f.id,
                              f.company
                            );
                          }}
                          className={`rounded-full px-3.5 py-1.5 font-mono text-[10px] uppercase border ${
                            activeFruit.id === f.id
                              ? "border-[#12271E] bg-[#12271E] text-white"
                              : "border-neutral-200 bg-[#FAF9F6] text-neutral-700"
                          }`}
                        >
                          {f.company}
                        </button>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-neutral-200 bg-[#FAF9F6] p-6 space-y-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#A47E3B]">
                        {activeFruit.company} · {activeFruit.period}
                      </p>
                      <h3 className="font-serif text-3xl text-[#12271E]">
                        {activeFruit.headline}
                      </h3>
                      <p className="text-sm leading-relaxed text-neutral-600">
                        {activeFruit.summary}
                      </p>
                      <p className="font-mono text-xs text-neutral-500 pt-2 border-t border-neutral-200">
                        {activeFruit.context}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleOpenMilestone(activeFruit.companyId)
                        }
                        className="font-mono text-[11px] uppercase text-[#12271E] underline underline-offset-4 hover:text-[#A47E3B]"
                      >
                        View {activeFruit.company} Role →
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "ai" && (
                  <div className="pr-6">
                    <AskStrategyAiPanel
                      milestones={milestones}
                      onRecommendBranch={(b) => setHighlightedBranch(b)}
                      onOpenMilestone={handleOpenMilestone}
                      onOpenConnect={(challenge) => {
                        setPreselectedChallenge(challenge);
                        openLeafTab("connect");
                      }}
                    />
                  </div>
                )}

                {activeTab === "diagnostic" && (
                  <div className="space-y-5 pr-8 max-w-2xl">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
                        Challenge Diagnostic
                      </p>
                      <h2 className="font-serif text-3xl text-[#12271E] mt-1">
                        Find your strategic bottleneck
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {DIAGNOSTIC_PROMPTS.map((dp) => (
                        <button
                          key={dp.id}
                          type="button"
                          onClick={() => {
                            setDiagPromptId(dp.id);
                            setDiagAnswers([]);
                            setDiagResult(null);
                          }}
                          className={`rounded-xl border p-3 text-left text-xs ${
                            diagPromptId === dp.id
                              ? "border-[#12271E] bg-[#12271E] text-white"
                              : "border-neutral-200 bg-[#FAF9F6] text-[#12271E]"
                          }`}
                        >
                          <p className="font-mono text-[9.5px] uppercase text-[#C9A65B]">
                            {dp.challengeCategory}
                          </p>
                          <p className="mt-1 text-sm">{dp.prompt}</p>
                        </button>
                      ))}
                    </div>

                    {(() => {
                      const opt =
                        DIAGNOSTIC_PROMPTS.find((p) => p.id === diagPromptId) ??
                        DIAGNOSTIC_PROMPTS[0];
                      return (
                        <div className="space-y-3 rounded-xl border border-neutral-200 bg-[#FAF9F6] p-4">
                          {opt.followUpQuestions.map((q) => {
                            const checked = diagAnswers.includes(q);
                            return (
                              <label
                                key={q}
                                className="flex items-start gap-2.5 text-xs text-[#12271E] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    setDiagAnswers((prev) =>
                                      checked
                                        ? prev.filter((x) => x !== q)
                                        : [...prev, q]
                                    )
                                  }
                                  className="mt-0.5 accent-[#12271E]"
                                />
                                <span>{q}</span>
                              </label>
                            );
                          })}
                          <textarea
                            rows={2}
                            value={diagDesc}
                            onChange={(e) => setDiagDesc(e.target.value)}
                            placeholder="Optional brief context..."
                            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs text-[#12271E] focus:border-[#12271E] focus:outline-none"
                          />
                          <button
                            type="button"
                            disabled={diagSaving}
                            onClick={() => void handleRunDiagnostic()}
                            className="rounded-full bg-[#12271E] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-white"
                          >
                            {diagSaving ? "Analyzing..." : "View Action Plan"}
                          </button>
                        </div>
                      );
                    })()}

                    {diagResult && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2">
                        <p className="font-mono text-[10px] uppercase text-emerald-800">
                          Recommended Branch: {diagResult.branchId}
                        </p>
                        <ul className="space-y-1 text-xs text-neutral-700">
                          {diagResult.actions.map((a) => (
                            <li key={a}>• {a}</li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          onClick={() => {
                            setPreselectedChallenge(
                              DIAGNOSTIC_PROMPTS.find(
                                (p) => p.id === diagPromptId
                              )?.challengeCategory
                            );
                            openLeafTab("connect");
                          }}
                          className="font-mono text-[10px] uppercase text-[#12271E] underline"
                        >
                          Send this to Sonia →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "seeds" && (
                  <div className="space-y-5 pr-8 max-w-2xl">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
                        Seeds · Advisory &amp; Future Growth
                      </p>
                      <h2 className="font-serif text-3xl text-[#12271E] mt-1">
                        Consultancy &amp; Startup Guidance
                      </h2>
                    </div>

                    <div className="divide-y divide-neutral-200 border-y border-neutral-200">
                      {SEEDS_DATA.map((seed) => (
                        <div key={seed.id} className="py-4 space-y-1">
                          <p className="font-mono text-[10px] uppercase text-[#A47E3B]">
                            {seed.organization} · {seed.period}
                          </p>
                          <h3 className="font-serif text-2xl text-[#12271E]">
                            {seed.title}
                          </h3>
                          <p className="text-sm text-neutral-600">
                            {seed.focus}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "connect" && (
                  <div className="pr-6 max-w-2xl">
                    <ConnectLeafPanel initialChallenge={preselectedChallenge} />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
