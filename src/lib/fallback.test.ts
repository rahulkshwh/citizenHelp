import { describe, it, expect } from "vitest";
import { getFallback } from "./fallback";

describe("getFallback", () => {
  it("provides safe fallback for scam mode", () => {
    const fallback = getFallback("scam") as { verdict: string; why: string; whatToDo: string[] };
    expect(fallback.verdict).toBe("Suspicious");
    expect(fallback.whatToDo.length).toBeGreaterThan(0);
    expect(fallback.why).toBeDefined();
  });

  it("provides safe fallback for explain mode", () => {
    const fallback = getFallback("explain") as { summary: string; asksOfMe: string; safeNextStep: string };
    expect(fallback.summary).toContain("could not explain");
    expect(fallback.safeNextStep).toBeDefined();
  });

  it("provides safe fallback for family mode", () => {
    const fallback = getFallback("family") as { message: string; safeNextStep: string };
    expect(fallback.message.length).toBeGreaterThan(0);
    expect(fallback.safeNextStep).toBeDefined();
  });
});

