"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { SUPPORTED_LANGUAGES, SupportedLang } from "@/lib/i18n";

type AppShellProps = { children: ReactNode };

function subscribeToSettings(onStoreChange: () => void) {
  window.addEventListener("saathi-settings-change", onStoreChange);
  return () => window.removeEventListener("saathi-settings-change", onStoreChange);
}

function getSetting(key: string) {
  return localStorage.getItem(key) === "true";
}

function getServerSetting() {
  return false;
}

function saveSetting(key: string, value: boolean) {
  localStorage.setItem(key, String(value));
  window.dispatchEvent(new Event("saathi-settings-change"));
}

export default function AppShell({ children }: AppShellProps) {
  const { lang, setLang, t } = useLanguage();

  const largeText = useSyncExternalStore(
    subscribeToSettings,
    () => getSetting("saathi-large-text"),
    getServerSetting,
  );
  const highContrast = useSyncExternalStore(
    subscribeToSettings,
    () => getSetting("saathi-high-contrast"),
    getServerSetting,
  );

  const navigation = [
    { href: "/", label: t.navToday },
    { href: "/scam-shield", label: t.navScamShield },
    { href: "/explain-it", label: t.navExplainIt },
    { href: "/medicines", label: t.navMedicines },
    { href: "/family", label: t.navFamily },
  ];

  return (
    <div className={`app-shell${largeText ? " text-large" : ""}${highContrast ? " high-contrast" : ""}`}>
      <a className="skip-link" href="#main-content">{t.skipLink}</a>
      <header className="site-header">
        <div className="site-title">Saathi (साथी)</div>
        <nav aria-label="Main navigation" className="site-nav">
          {navigation.map((item) => (
            <Link className="nav-button" href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div aria-label="Display settings" className="display-controls">
          <div className="language-selector-wrapper">
            <label htmlFor="language-select" className="sr-only">
              {t.selectLanguage}
            </label>
            <select
              id="language-select"
              className="setting-button language-select"
              value={lang}
              onChange={(e) => setLang(e.target.value as SupportedLang)}
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  🌐 {l.label}
                </option>
              ))}
            </select>
          </div>
          <button className="setting-button" onClick={() => saveSetting("saathi-large-text", !largeText)} type="button">
            {largeText ? "A−" : "A+"}<span className="sr-only"> {largeText ? t.standardSize : t.largerSize}</span>
          </button>
          <button aria-pressed={highContrast} className="setting-button" onClick={() => saveSetting("saathi-high-contrast", !highContrast)} type="button">{t.highContrast}</button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer>{t.footerDisclaimer}</footer>
    </div>
  );
}
