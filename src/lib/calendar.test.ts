import { describe, it, expect } from "vitest";
import { generateIcsContent, parseDeadlineToDate } from "./calendar";

describe("generateIcsContent", () => {
  it("creates valid iCalendar structure", () => {
    const ics = generateIcsContent({
      title: "Doctor Appointment",
      description: "Remember to bring blood test results",
      date: new Date(2026, 8, 25), // Sep 25 2026
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("SUMMARY:Doctor Appointment");
    expect(ics).toContain("DESCRIPTION:Remember to bring blood test results");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260925");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("parses valid deadline dates correctly", () => {
    const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const dateStr = futureDate.toISOString();
    const parsed = parseDeadlineToDate(dateStr);
    expect(parsed.getTime()).toBeGreaterThan(Date.now());
  });
});
