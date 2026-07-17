/**
 * Public enrollment / parent-form intake guards (client-side).
 * Complements Firestore rules; does not replace App Check in production.
 */

const RATE_KEY = "schoolflow-public-intake-rate";
const MAX_SUBMITS = 5;
const WINDOW_MS = 10 * 60 * 1000;

export function isPlausibleTenantId(tenantId: string): boolean {
  const t = tenantId.trim();
  if (t.length < 4 || t.length > 128) return false;
  // Alphanumeric, dash, underscore only
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]*$/.test(t);
}

export function isHoneypotTripped(value: string | undefined | null): boolean {
  return Boolean(value && String(value).trim().length > 0);
}

type RateBucket = { timestamps: number[] };

function readBucket(): RateBucket {
  if (typeof sessionStorage === "undefined") return { timestamps: [] };
  try {
    const raw = sessionStorage.getItem(RATE_KEY);
    if (!raw) return { timestamps: [] };
    const parsed = JSON.parse(raw) as RateBucket;
    return Array.isArray(parsed.timestamps) ? parsed : { timestamps: [] };
  } catch {
    return { timestamps: [] };
  }
}

function writeBucket(bucket: RateBucket) {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(RATE_KEY, JSON.stringify(bucket));
  } catch {
    // ignore quota errors
  }
}

/** Returns true if this submit is allowed; records the attempt when allowed. */
export function consumePublicIntakeSlot(now = Date.now()): boolean {
  const bucket = readBucket();
  const recent = bucket.timestamps.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_SUBMITS) {
    writeBucket({ timestamps: recent });
    return false;
  }
  recent.push(now);
  writeBucket({ timestamps: recent });
  return true;
}

export function validatePublicIntake(input: {
  tenantId: string;
  honeypot?: string | null;
}): { ok: true } | { ok: false; reason: string } {
  if (!isPlausibleTenantId(input.tenantId)) {
    return { ok: false, reason: "This enrollment link is missing or invalid. Ask your school for the correct URL." };
  }
  if (isHoneypotTripped(input.honeypot)) {
    // Silent success path handled by caller
    return { ok: false, reason: "honeypot" };
  }
  if (!consumePublicIntakeSlot()) {
    return { ok: false, reason: "Too many submissions from this browser. Please wait a few minutes and try again." };
  }
  return { ok: true };
}
