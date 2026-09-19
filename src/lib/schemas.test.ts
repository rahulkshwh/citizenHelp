import { describe, it, expect } from "vitest";
import { aiRequestSchema, parseAiResponse } from "./schemas";

describe("aiRequestSchema", () => {
  it("validates valid scam request", () => {
    const input = { mode: "scam", text: "Suspicious message", lang: "en" };
    const result = aiRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("validates valid explain request", () => {
    const input = { mode: "explain", text: "Medical bill summary", lang: "en" };
    const result = aiRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("validates valid family request", () => {
    const input = { mode: "family", text: "Can you help me with groceries?", lang: "en" };
    const result = aiRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects empty text", () => {
    const input = { mode: "scam", text: "   ", lang: "en" };
    const result = aiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects text longer than 2000 characters", () => {
    const input = { mode: "scam", text: "a".repeat(2001), lang: "en" };
    const result = aiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects invalid mode", () => {
    const input = { mode: "invalid", text: "Hello", lang: "en" };
    const result = aiRequestSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});

describe("parseAiResponse", () => {
  it("parses valid scam response", () => {
    const raw = {
      verdict: "Dangerous",
      why: "Contains urgent request for OTP",
      whatToDo: ["Do not reply", "Call official bank"],
      trustedPersonNote: "Speak to bank immediately",
    };
    const parsed = parseAiResponse("scam", raw);
    expect(parsed).toEqual(raw);
  });

  it("parses valid explain response", () => {
    const raw = {
      summary: "This is a water bill for $45",
      asksOfMe: "Pay the bill",
      deadline: "Due on 15th Oct",
      safeNextStep: "Pay through official website",
      questionsToAsk: ["Can I pay in instalments?", "Who can I contact?", "Is there a discount?"],
      trustedPersonNote: "Ask trusted family member if in doubt",
    };
    const parsed = parseAiResponse("explain", raw);
    expect(parsed).toEqual(raw);
  });

  it("parses valid family response", () => {
    const raw = {
      message: "Hi Sarah, could you please visit this weekend?",
      safeNextStep: "Send this message via WhatsApp or SMS",
    };
    const parsed = parseAiResponse("family", raw);
    expect(parsed).toEqual(raw);
  });
});

