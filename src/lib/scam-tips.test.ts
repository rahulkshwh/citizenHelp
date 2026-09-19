import { describe, it, expect } from "vitest";
import { getDailyScamTip, DAILY_SCAM_TIPS } from "./scam-tips";

describe("getDailyScamTip", () => {
  it("returns a valid scam tip with title and tip text", () => {
    const tip = getDailyScamTip(new Date());
    expect(tip).toBeDefined();
    expect(tip.title).toBeTruthy();
    expect(tip.tip).toBeTruthy();
    expect(DAILY_SCAM_TIPS).toContainEqual(tip);
  });
});

