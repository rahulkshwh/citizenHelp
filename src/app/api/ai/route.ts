import { NextRequest, NextResponse } from "next/server";
import { getFallback } from "@/lib/fallback";
import { generateGeminiResponse } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/ratelimit";
import { aiRequestSchema, parseAiResponse } from "@/lib/schemas";

export const runtime = "nodejs";

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";
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
    return NextResponse.json({ ...response, fallback: false });
  } catch {
    return NextResponse.json({
      ...getFallback(parsed.data.mode),
      fallback: true,
      reason: "service_unavailable",
    });
  }
}
