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

  it("returns next medicine when upcoming dose exists", () => {
    const today = getTodayDateString();
    const meds: Medicine[] = [
      {
        id: "1",
        name: "Morning Med",
        dosage: "1 tab",
        time: "08:00",
        instructions: "",
        lastTakenDate: today,
      },
      {
        id: "2",
        name: "Evening Med",
        dosage: "1 tab",
        time: "23:59",
        instructions: "",
      },
    ];

    const { nextMed, missedMeds } = getMedicineStatus(meds);
    expect(nextMed?.id).toBe("2");
    expect(missedMeds.length).toBe(0);
  });

  it("returns null nextMed when all doses are taken today", () => {
    const today = getTodayDateString();
    const meds: Medicine[] = [
      {
        id: "1",
        name: "Morning Med",
        dosage: "1 tab",
        time: "08:00",
        instructions: "",
        lastTakenDate: today,
      },
    ];

    const { nextMed } = getMedicineStatus(meds);
    expect(nextMed).toBeNull();
  });

  it("flags missed doses when past scheduled time and untaken", () => {
    const meds: Medicine[] = [
      {
        id: "1",
        name: "Very Early Morning Med",
        dosage: "1 tab",
        time: "01:00",
        instructions: "",
      },
    ];

    const { missedMeds } = getMedicineStatus(meds);
    expect(missedMeds.length).toBe(1);
    expect(missedMeds[0].name).toBe("Very Early Morning Med");
  });
});
