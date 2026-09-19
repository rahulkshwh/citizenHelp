import { describe, it, expect } from "vitest";
import {
  formatTimeDisplay,
  getMedicineStatus,
  isMedicineTakenToday,
  getTodayDateString,
  type Medicine,
} from "./medicines";


describe("medicines utility", () => {
  it("formats times to 12-hour AM/PM format correctly", () => {
    expect(formatTimeDisplay("08:00")).toBe("8:00 AM");
    expect(formatTimeDisplay("13:30")).toBe("1:30 PM");
    expect(formatTimeDisplay("20:00")).toBe("8:00 PM");
    expect(formatTimeDisplay("00:15")).toBe("12:15 AM");
  });

  it("checks whether medicine is taken today", () => {
    const today = getTodayDateString();
    const med1: Medicine = {
      id: "1",
      name: "Med 1",
      dosage: "1",
      time: "08:00",
      instructions: "",
      lastTakenDate: today,
    };
    const med2: Medicine = {
      id: "2",
      name: "Med 2",
      dosage: "1",
      time: "13:00",
      instructions: "",
      lastTakenDate: "2020-01-01",
    };

    expect(isMedicineTakenToday(med1)).toBe(true);
    expect(isMedicineTakenToday(med2)).toBe(false);
  });

  it("identifies next medicine and missed medicine", () => {
    const meds: Medicine[] = [
      {
        id: "1",
        name: "Morning Med",
        dosage: "1 tab",
        time: "06:00", // in the past
        instructions: "",
      },
      {
        id: "2",
        name: "Evening Med",
        dosage: "1 tab",
        time: "23:59", // in the future
        instructions: "",
      },
    ];

    const { nextMed, missedMeds } = getMedicineStatus(meds);
    expect(nextMed).toBeDefined();
    expect(nextMed?.name).toBeTruthy();
    expect(Array.isArray(missedMeds)).toBe(true);
  });
});

