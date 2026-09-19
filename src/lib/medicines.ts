"use client";

import { useSyncExternalStore, useCallback } from "react";

export type Medicine = {
  id: string;
  name: string;
  dosage: string;
  time: string; // "08:00", "13:00", "20:00"
  instructions: string;
  lastTakenDate?: string; // YYYY-MM-DD
};

export const DEFAULT_MEDICINES: Medicine[] = [
  {
    id: "med-1",
    name: "Blood Pressure Pill (Amlodipine)",
    dosage: "5 mg",
    time: "08:00",
    instructions: "Take with water after breakfast",
  },
  {
    id: "med-2",
    name: "Multivitamin / Calcium",
    dosage: "1 tablet",
    time: "13:00",
    instructions: "Take with lunch",
  },
  {
    id: "med-3",
    name: "Cholesterol Pill (Atorvastatin)",
    dosage: "10 mg",
    time: "20:00",
    instructions: "Take after dinner before sleep",
  },
];

const STORAGE_KEY = "saathi-medicines";

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function loadMedicines(): Medicine[] {
  if (typeof window === "undefined") return DEFAULT_MEDICINES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_MEDICINES));
      return DEFAULT_MEDICINES;
    }
    return JSON.parse(raw) as Medicine[];
  } catch {
    return DEFAULT_MEDICINES;
  }
}

export function saveMedicines(medicines: Medicine[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
  window.dispatchEvent(new Event("saathi-medicines-change"));
}

export function toggleMedicineTaken(id: string): Medicine[] {
  const meds = loadMedicines();
  const today = getTodayDateString();
  const updated = meds.map((med) => {
    if (med.id === id) {
      const isTakenToday = med.lastTakenDate === today;
      return {
        ...med,
        lastTakenDate: isTakenToday ? undefined : today,
      };
    }
    return med;
  });
  saveMedicines(updated);
  return updated;
}

export function isMedicineTakenToday(med: Medicine): boolean {
  return med.lastTakenDate === getTodayDateString();
}

export function formatTimeDisplay(timeStr: string): string {
  const [hStr, mStr] = timeStr.split(":");
  const hour = parseInt(hStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${mStr || "00"} ${ampm}`;
}

export function getMedicineStatus(medicines: Medicine[]) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const today = getTodayDateString();

  let nextMed: Medicine | null = null;
  let nextDiff = Infinity;
  const missedMeds: Medicine[] = [];

  for (const med of medicines) {
    const isTaken = med.lastTakenDate === today;
    const [h, m] = med.time.split(":").map(Number);
    const medMinutes = h * 60 + (m || 0);

    if (!isTaken) {
      if (medMinutes < currentMinutes - 30) {
        // Scheduled more than 30 mins ago and not taken
        missedMeds.push(med);
      } else if (medMinutes >= currentMinutes - 30 && (medMinutes - currentMinutes) < nextDiff) {
        nextDiff = medMinutes - currentMinutes;
        nextMed = med;
      }
    }
  }

  // If no upcoming untaken today, take first untaken if any
  if (!nextMed) {
    nextMed = medicines.find((m) => m.lastTakenDate !== today) || null;
  }

  return { nextMed, missedMeds };
}

function subscribeMedicines(callback: () => void) {
  window.addEventListener("saathi-medicines-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("saathi-medicines-change", callback);
    window.removeEventListener("storage", callback);
  };
}

let cachedMedsRaw = "";
let cachedMeds: Medicine[] = DEFAULT_MEDICINES;

function getMedicinesSnapshot(): Medicine[] {
  if (typeof window === "undefined") return DEFAULT_MEDICINES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    if (raw !== cachedMedsRaw) {
      cachedMedsRaw = raw;
      cachedMeds = raw ? (JSON.parse(raw) as Medicine[]) : DEFAULT_MEDICINES;
    }
    return cachedMeds;
  } catch {
    return DEFAULT_MEDICINES;
  }
}

function getMedicinesServerSnapshot(): Medicine[] {
  return DEFAULT_MEDICINES;
}

export function useMedicines() {
  const medicines = useSyncExternalStore(
    subscribeMedicines,
    getMedicinesSnapshot,
    getMedicinesServerSnapshot,
  );

  const addMedicine = useCallback((med: Omit<Medicine, "id">) => {
    const newMed: Medicine = {
      ...med,
      id: `med-${Date.now()}`,
    };
    const updated = [...loadMedicines(), newMed].sort((a, b) => a.time.localeCompare(b.time));
    saveMedicines(updated);
    return newMed;
  }, []);

  const removeMedicine = useCallback((id: string) => {
    const updated = loadMedicines().filter((m) => m.id !== id);
    saveMedicines(updated);
  }, []);

  const toggleMedicine = useCallback((id: string) => {
    toggleMedicineTaken(id);
  }, []);

  const resetDefaults = useCallback(() => {
    saveMedicines(DEFAULT_MEDICINES);
  }, []);

  return {
    medicines,
    addMedicine,
    removeMedicine,
    toggleMedicineTaken: toggleMedicine,
    resetDefaults,
  };
}
