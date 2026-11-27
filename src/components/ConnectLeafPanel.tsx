"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, Loader2, Send } from "lucide-react";
import { DIAGNOSTIC_PROMPTS, SONIA_IDENTITY } from "@/data/soniaData";
import { getAnonymousSessionId, trackEngagement } from "@/lib/tracker";

interface ConnectLeafPanelProps {
  initialChallenge?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function ConnectLeafPanel({ initialChallenge }: ConnectLeafPanelProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [businessChallenge, setBusinessChallenge] = useState(
    initialChallenge || DIAGNOSTIC_PROMPTS[0].challengeCategory
  );
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [feedback, setFeedback] = useState("");
  const [sentFingerprint, setSentFingerprint] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "submitting") return;

    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Enter your name (2+ chars).";
    if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email.";
    if (businessChallenge.trim().length < 3) {
      errors.businessChallenge = "Select a business challenge.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const fp = `${email.trim().toLowerCase()}|${businessChallenge.trim().toLowerCase()}|${message.trim().toLowerCase()}`;
    if (sentFingerprint && fp === sentFingerprint) {
      setStatus("error");
      setFeedback("This enquiry was already submitted.");
      return;
    }

    setStatus("submitting");
    setFeedback("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          businessChallenge: businessChallenge.trim(),
          subject: businessChallenge.trim(),
          message: message.trim(),
          website,
          sessionId: getAnonymousSessionId(),
        }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
        classification?: string;
        fieldErrors?: Record<string, string>;
      };
      if (!res.ok || !data.ok) {
        if (data.fieldErrors) setFieldErrors(data.fieldErrors);
        setStatus("error");
        setFeedback(
          data.error || "Unable to submit enquiry right now. Try LinkedIn."
        );
        return;
      }

      setSentFingerprint(fp);
      setName("");
      setEmail("");
      setCompany("");
      setMessage("");
      setFieldErrors({});
      setStatus("success");
      setFeedback(
        `${data.message ?? "Enquiry received."} (Category: ${
          data.classification ?? businessChallenge
        })`
      );
    } catch {
      setStatus("error");
      setFeedback("Network error while sending enquiry. Please try again.");
    }
  };

  return (
    <div className="space-y-4 text-[#12271E]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#A47E3B]">
            Connect
          </p>
          <h3 className="font-serif text-2xl text-[#12271E]">
            Message Sonia Specialist
          </h3>
        </div>

        {SONIA_IDENTITY.linkedinUrl && (
          <a
            href={SONIA_IDENTITY.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackEngagement(
                "linkedin_clicked",
                "connect-leaf-linkedin",
                "LinkedIn Profile"
              )
            }
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-[#FAF9F6] px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[#12271E] hover:border-[#12271E]"
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-[#A47E3B]" />
          </a>
        )}
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
        <div className="hidden" aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="leaf-name"
              className="block font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1"
            >
              Name *
            </label>
            <input
              id="leaf-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-[#12271E] placeholder:text-neutral-400 focus:border-[#12271E] focus:outline-none"
            />
            {fieldErrors.name && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="leaf-email"
              className="block font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1"
            >
              Email *
            </label>
            <input
              id="leaf-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-[#12271E] placeholder:text-neutral-400 focus:border-[#12271E] focus:outline-none"
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label
              htmlFor="leaf-challenge"
              className="block font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1"
            >
              Challenge *
            </label>
            <select
              id="leaf-challenge"
              value={businessChallenge}
              onChange={(e) => setBusinessChallenge(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-[#12271E] focus:border-[#12271E] focus:outline-none"
            >
              {DIAGNOSTIC_PROMPTS.map((dp) => (
                <option key={dp.id} value={dp.challengeCategory}>
                  {dp.challengeCategory}
                </option>
              ))}
              <option value="Fractional CMO / Executive Advisory">
                Fractional CMO / Executive Advisory
              </option>
              <option value="General Strategy Enquiry">
                General Strategy Enquiry
              </option>
            </select>
          </div>

          <div>
            <label
              htmlFor="leaf-company"
              className="block font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1"
            >
              Company (optional)
            </label>
            <input
              id="leaf-company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Organization"
              className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-[#12271E] placeholder:text-neutral-400 focus:border-[#12271E] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="leaf-message"
            className="block font-mono text-[10px] uppercase tracking-[0.14em] text-neutral-500 mb-1"
          >
            Note (optional)
          </label>
          <textarea
            id="leaf-message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share a brief note..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-sm text-[#12271E] placeholder:text-neutral-400 focus:border-[#12271E] focus:outline-none"
          />
        </div>

        {status === "success" && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs text-emerald-900"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{feedback}</span>
          </div>
        )}

        {status === "error" && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs text-red-800"
          >
            {feedback}
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center gap-2 rounded-full bg-[#12271E] px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#1B3A2D] disabled:opacity-60"
        >
          {status === "submitting" ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>Send Note</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
