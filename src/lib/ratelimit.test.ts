import { describe, it, expect } from "vitest";
import { checkRateLimit } from "./ratelimit";

describe("checkRateLimit", () => {
  it("allows initial requests within limit", () => {
    const ip = "test-ip-1";
    const result = checkRateLimit(ip);
    expect(result.allowed).toBe(true);
    expect(result.retryAfterSeconds).toBe(0);
  });

  it("blocks requests when exceeding 10 per minute", () => {
    const ip = "test-ip-spam";
    const startTime = 1000000;

    for (let i = 0; i < 10; i++) {
      const res = checkRateLimit(ip, startTime + i * 100);
      expect(res.allowed).toBe(true);
    }

    const blocked = checkRateLimit(ip, startTime + 2000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("resets limit after window expires", () => {
    const ip = "test-ip-reset";
    const startTime = 2000000;

    for (let i = 0; i < 10; i++) {
      checkRateLimit(ip, startTime);
    }
    expect(checkRateLimit(ip, startTime).allowed).toBe(false);

    // After 61 seconds
    const afterWindow = checkRateLimit(ip, startTime + 61_000);
    expect(afterWindow.allowed).toBe(true);
  });
});

