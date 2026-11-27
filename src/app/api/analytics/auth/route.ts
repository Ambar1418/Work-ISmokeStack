import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getAdminSecret,
  verifyAdminSecret,
} from "@/lib/analyticsAuth";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  hashClientIp,
} from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (!getAdminSecret()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "ADMIN_ANALYTICS_SECRET is not configured in environment variables.",
      },
      { status: 503 }
    );
  }

  const rawIp = getClientIpFromHeaders(req.headers);
  const ipHash = hashClientIp(rawIp) || "unknown";
  const limit = checkRateLimit(`admin-auth:${ipHash}`, 10, 10 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Too many login attempts. Try again in ${limit.retryAfterSeconds}s.`,
      },
      { status: 429 }
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

  const secretInput =
    body &&
    typeof body === "object" &&
    typeof (body as Record<string, unknown>).secret === "string"
      ? (body as Record<string, string>).secret
      : "";

  if (!verifyAdminSecret(secretInput)) {
    return NextResponse.json(
      { ok: false, error: "Invalid passphrase." },
      { status: 401 }
    );
  }

  const token = createAdminSessionToken();
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true }, { status: 200 });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}

