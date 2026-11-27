"use client";

import type { EngagementEventType } from "./db";

const SESSION_KEY = "sonia_anon_session_v1";

export function getAnonymousSessionId(): string {
  if (typeof window === "undefined") return "ssr";

  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing && existing.length <= 64) return existing;

    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;

    window.sessionStorage.setItem(SESSION_KEY, generated);
    return generated;
  } catch {
    return `s_${Date.now().toString(36)}`;
  }
}

export function trackEngagement(
  eventType: EngagementEventType,
  targetId?: string,
  targetLabel?: string,
  metadata?: Record<string, string | number | boolean>
): void {
  if (typeof window === "undefined") return;

  const sessionId = getAnonymousSessionId();
  const payload = JSON.stringify({
    eventType,
    sessionId,
    targetId,
    targetLabel,
    metadata,
  });

  try {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // Silent failure: telemetry must never interrupt user experience
  }
}

