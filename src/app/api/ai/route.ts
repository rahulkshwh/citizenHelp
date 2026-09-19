import { NextRequest, NextResponse } from "next/server";
import { getFallback } from "@/lib/fallback";
import { generateGeminiResponse } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ratelimit";
import { aiRequestSchema, parseAiResponse, type AiResponse } from "@/lib/schemas";

export const runtime = "nodejs";

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

type CacheEntry = {
  response: AiResponse;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache
const MAX_CACHE_SIZE = 150;

function getCacheKey(mode: string, text: string, lang: string): string {
  return `${mode}:${lang}:${text.trim().toLowerCase()}`;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = aiRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Check in-memory cache for instant zero-latency response
  const cacheKey = getCacheKey(parsed.data.mode, parsed.data.text, parsed.data.lang);
  const cached = responseCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return NextResponse.json(
      { ...cached.response, fallback: false, cached: true },
      { headers: { "X-Cache": "HIT" } },
    );
  }

  const rateLimit = checkRateLimit(getClientIp(request));

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { ...getFallback(parsed.data.mode), fallback: true, reason: "rate_limited" },
      { headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } },
    );
  }

  try {
    const generated = await generateGeminiResponse(parsed.data);
    const response = parseAiResponse(parsed.data.mode, generated);

    // Store in cache
    if (responseCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = responseCache.keys().next().value;
      if (oldestKey) responseCache.delete(oldestKey);
    }
    responseCache.set(cacheKey, {
      response,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return NextResponse.json(
      { ...response, fallback: false, cached: false },
      { headers: { "X-Cache": "MISS" } },
    );
  } catch {
    return NextResponse.json({
      ...getFallback(parsed.data.mode),
      fallback: true,
      reason: "service_unavailable",
    });
  }
}
