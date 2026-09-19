"use client";

import { useSyncExternalStore } from "react";
import { SupportedLang, SUPPORTED_LANGUAGES, translations, getVoiceLangCode } from "@/lib/i18n";

const STORAGE_KEY = "saathi-language";

function subscribeToLanguage(onStoreChange: () => void) {
  window.addEventListener("saathi-language-change", onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener("saathi-language-change", onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

let cachedLang: SupportedLang = "en";

function getLanguageSnapshot(): SupportedLang {
  if (typeof window === "undefined") return "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as SupportedLang | null;
    if (stored && SUPPORTED_LANGUAGES.some((l) => l.code === stored)) {
      cachedLang = stored;
    } else {
      cachedLang = "en";
    }
  } catch {
    cachedLang = "en";
  }
  return cachedLang;
}

function getLanguageServerSnapshot(): SupportedLang {
  return "en";
}

export function saveLanguage(lang: SupportedLang) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      window.dispatchEvent(new Event("saathi-language-change"));
    } catch {
      // ignore
    }
  }
}

export function useLanguage() {
  const lang = useSyncExternalStore(
    subscribeToLanguage,
    getLanguageSnapshot,
    getLanguageServerSnapshot
  );

  const t = translations[lang] || translations.en;
  const voiceLang = getVoiceLangCode(lang);

  return {
    lang,
    setLang: saveLanguage,
    t,
    voiceLang,
  };
}

