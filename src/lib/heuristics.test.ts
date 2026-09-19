import { describe, it, expect } from "vitest";
import { scoreScamText, LOW_RISK_SCORE, HIGH_RISK_SCORE } from "./heuristics";

describe("scoreScamText heuristics", () => {
  it("scores low for harmless personal text", () => {
    const result = scoreScamText("Hi Dad, see you for lunch at 1pm tomorrow!");
    expect(result.score).toBeLessThan(LOW_RISK_SCORE);
    expect(result.signals).toHaveLength(0);
  });

  it("identifies high-risk scam with OTP and urgent pressure", () => {
    const text = "URGENT: Your bank account will be blocked immediately unless you share your OTP within 10 minutes!";
    const result = scoreScamText(text);
    expect(result.score).toBeGreaterThanOrEqual(HIGH_RISK_SCORE);
    expect(result.signals).toContain("Urgent pressure");
    expect(result.signals).toContain("Request for an OTP, PIN, password, or CVV");
    expect(result.signals).toContain("Claim to be a bank or government authority");
  });

  it("identifies remote access and gift card scams", () => {
    const text = "Please install AnyDesk for remote access and pay via gift card";
    const result = scoreScamText(text);
    expect(result.score).toBeGreaterThanOrEqual(LOW_RISK_SCORE);
    expect(result.signals).toContain("Remote-access app request");
    expect(result.signals).toContain("Gift card, UPI, or crypto payment");
  });

  it("detects prize and suspicious link", () => {
    const text = "You won the lottery! Click here: http://bit.ly/claim";
    const result = scoreScamText(text);
    expect(result.signals).toContain("Prize or lottery claim");
    expect(result.signals).toContain("Suspicious link");
  });
});

