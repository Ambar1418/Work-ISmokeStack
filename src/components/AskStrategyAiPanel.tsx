"use client";

import { useState, type FormEvent } from "react";
import {
  AlertCircle,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { DIAGNOSTIC_PROMPTS, type StrategyBranch } from "@/data/soniaData";
import type { CmsMilestoneRecord } from "@/lib/db";
import type { StructuredAiStrategyResponse } from "@/lib/ai";
import { getAnonymousSessionId, trackEngagement } from "@/lib/tracker";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
  structured?: StructuredAiStrategyResponse;
  notice?: string;
}

interface AskStrategyAiPanelProps {
  milestones: CmsMilestoneRecord[];
  onRecommendBranch: (branchId: StrategyBranch["id"]) => void;
  onOpenMilestone: (milestoneId: string) => void;
  onOpenConnect: (preselectedChallenge?: string) => void;
}

const OPENING_MESSAGE =
  "Every business has a different challenge. Tell me what's on your mind, and discover which part of Sonia's experience connects with it.";

export function AskStrategyAiPanel({
  milestones,
  onRecommendBranch,
  onOpenMilestone,
  onOpenConnect,
}: AskStrategyAiPanelProps) {
  const [turns, setTurns] = useState<ChatTurn[]>([
    { role: "assistant", content: OPENING_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(
    null
  );

  const askQuestion = async (questionText: string) => {
    const q = questionText.trim();
    if (!q || loading) return;

    setErrorMsg(null);
    setLastFailedQuestion(null);
    setLoading(true);

    const historyForApi = turns
      .slice(1)
      .map((t) => ({ role: t.role, content: t.content }));

    setTurns((prev) => [...prev, { role: "user", content: q }]);
    setInput("");

    try {
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          history: historyForApi,
          sessionId: getAnonymousSessionId(),
        }),
      });

      const payload = (await res.json()) as {
        ok?: boolean;
        error?: string;
        data?: StructuredAiStrategyResponse;
        fallback?: StructuredAiStrategyResponse;
      };

      if (res.ok && payload.ok && payload.data) {
        const structured = payload.data;
        onRecommendBranch(structured.recommendedBranchId);
        setTurns((prev) => [
          ...prev,
          { role: "assistant", content: structured.answer, structured },
        ]);
      } else if (payload.fallback) {
        const fb = payload.fallback;
        onRecommendBranch(fb.recommendedBranchId);
        setTurns((prev) => [
          ...prev,
          {
            role: "assistant",
            content: fb.answer,
            structured: fb,
            notice:
              payload.error ||
              "Live Groq API key not configured yet; showing verified profile match.",
          },
        ]);
      } else {
        setErrorMsg(payload.error || "Unable to reach AI Strategy Guide.");
        setLastFailedQuestion(q);
      }
    } catch {
      setErrorMsg("Network error reaching the AI guide. Please retry.");
      setLastFailedQuestion(q);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void askQuestion(input);
  };

  return (
    <div className="space-y-4 text-[#12271E]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
            AI Strategy Guide
          </p>
          <h3 className="font-serif text-2xl text-[#12271E]">
            Ask Sonia&apos;s Strategy Tree
          </h3>
        </div>
        <span className="rounded-full border border-emerald-700/20 bg-emerald-50 px-3 py-1 font-mono text-[10px] text-emerald-800">
          Verified Profile
        </span>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-1.5">
        {DIAGNOSTIC_PROMPTS.map((dp) => (
          <button
            key={dp.id}
            type="button"
            disabled={loading}
            onClick={() => void askQuestion(dp.prompt)}
            className="rounded-full border border-neutral-200 bg-[#FAF9F6] px-3 py-1 text-xs text-[#12271E] transition-colors hover:border-[#12271E] disabled:opacity-50"
          >
            {dp.prompt}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
        {turns.map((turn, idx) => (
          <div
            key={`${turn.role}-${idx}`}
            className={`rounded-xl p-4 ${
              turn.role === "user"
                ? "ml-8 bg-[#12271E] text-white"
                : "mr-4 bg-[#FAF9F6] border border-neutral-200 text-[#12271E]"
            }`}
          >
            <p
              className={`font-mono text-[9.5px] uppercase tracking-[0.16em] mb-1 ${
                turn.role === "user" ? "text-[#C9A65B]" : "text-[#A47E3B]"
              }`}
            >
              {turn.role === "user" ? "You" : "AI Strategy Guide"}
            </p>
            <p className="text-sm leading-relaxed">{turn.content}</p>

            {turn.notice && (
              <p className="mt-2 rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-1.5 font-mono text-[10px] text-amber-900">
                {turn.notice}
              </p>
            )}

            {turn.structured && (
              <div className="mt-3 pt-3 border-t border-neutral-200 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-neutral-500">
                    Branch:
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onRecommendBranch(turn.structured!.recommendedBranchId)
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-700/25 px-2.5 py-0.5 font-mono text-[10px] uppercase text-emerald-900"
                  >
                    <Sparkles className="h-2.5 w-2.5" />
                    {turn.structured.recommendedBranchId}
                  </button>

                  {turn.structured.relevantMilestoneIds.map((mid) => {
                    const ms = milestones.find((m) => m.id === mid);
                    return (
                      <button
                        key={mid}
                        type="button"
                        onClick={() => onOpenMilestone(mid)}
                        className="rounded-full border border-neutral-300 bg-white px-2.5 py-0.5 text-[11px] text-[#12271E] hover:border-[#12271E]"
                      >
                        {ms?.company ?? mid} →
                      </button>
                    );
                  })}
                </div>

                {turn.structured.supportingEvidence.length > 0 && (
                  <p className="text-xs text-neutral-600">
                    {turn.structured.supportingEvidence[0]}
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      void askQuestion(turn.structured!.suggestedNextQuestion)
                    }
                    className="text-left font-mono text-[10px] text-emerald-800 hover:underline"
                  >
                    Ask next: &ldquo;{turn.structured.suggestedNextQuestion}&rdquo;
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      trackEngagement(
                        "contact_clicked",
                        "ai-to-contact",
                        turn.structured?.challengeCategory
                      );
                      onOpenConnect(turn.structured?.challengeCategory);
                    }}
                    className="font-mono text-[10px] uppercase text-[#A47E3B] hover:underline"
                  >
                    Connect →
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-[#FAF9F6] px-4 py-3 text-xs text-neutral-600">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-700" />
            <span>Thinking...</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-800">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMsg}
          </span>
          {lastFailedQuestion && (
            <button
              type="button"
              onClick={() => void askQuestion(lastFailedQuestion)}
              className="inline-flex items-center gap-1 rounded-full border border-red-300 px-2.5 py-1 font-mono text-[10px] uppercase"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about lead generation, positioning, operations..."
          disabled={loading}
          className="flex-1 rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-sm text-[#12271E] placeholder:text-neutral-400 focus:border-[#12271E] focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || input.trim().length < 3}
          aria-label="Ask Sonia's Strategy Tree"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#12271E] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#1B3A2D] disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Ask</span>
        </button>
      </form>
    </div>
  );
}
