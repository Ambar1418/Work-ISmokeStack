import crypto from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE_NAME = "sonia_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

export function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_ANALYTICS_SECRET?.trim();
  return secret && secret.length > 0 ? secret : null;
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function verifyAdminSecret(candidate: string): boolean {
  const secret = getAdminSecret();
  if (!secret || !candidate) return false;
  return timingSafeEqualString(candidate.trim(), secret);
}

export function createAdminSessionToken(): string {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_ANALYTICS_SECRET is not configured.");
  }
  const expiresAt = String(Date.now() + SESSION_TTL_MS);
  const signature = crypto
    .createHmac("sha256", secret)
    .update(expiresAt)
    .digest("hex");
  return `${expiresAt}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const secret = getAdminSecret();
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [expiresAtStr, signature] = parts;
  const expiresAt = Number(expiresAtStr);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) {
    return false;
  }
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(expiresAtStr)
    .digest("hex");
  return timingSafeEqualString(signature, expectedSig);
}

export function isAuthorizedAnalyticsRequest(req: NextRequest): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const bearerToken = authHeader.slice("Bearer ".length).trim();
    if (verifyAdminSecret(bearerToken)) return true;
  }

  const headerSecret = req.headers.get("x-admin-secret");
  if (headerSecret && verifyAdminSecret(headerSecret)) {
    return true;
  }

  const cookieToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSessionToken(cookieToken);
}

