import crypto from "node:crypto";

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export function hashClientIp(rawIp: string | null): string | null {
  if (!rawIp) return null;
  const salt = process.env.ADMIN_ANALYTICS_SECRET || "sonia-portfolio-salt";
  return crypto
    .createHmac("sha256", salt)
    .update(rawIp.trim())
    .digest("hex")
    .slice(0, 24);
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    buckets.set(key, bucket);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);

  // Prune stale keys periodically
  if (buckets.size > 2000) {
    for (const [k, b] of buckets.entries()) {
      if (b.timestamps.every((t) => t <= windowStart)) {
        buckets.delete(k);
      }
    }
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - bucket.timestamps.length),
    retryAfterSeconds: 0,
  };
}

