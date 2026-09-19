"use client";

import Link from "next/link";
import { useSyncExternalStore, type ReactNode } from "react";

const navigation = [
  { href: "/", label: "Today" },
  { href: "/scam-shield", label: "Scam Shield" },
  { href: "/explain-it", label: "Explain It" },
  { href: "/medicines", label: "Medicines" },
  { href: "/family", label: "Family" },
];

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

  return (
    <div className={`app-shell${largeText ? " text-large" : ""}${highContrast ? " high-contrast" : ""}`}>
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <header className="site-header">
        <div className="site-title">Saathi</div>
        <nav aria-label="Main navigation" className="site-nav">
          {navigation.map((item) => (
            <Link className="nav-button" href={item.href} key={item.href}>{item.label}</Link>
          ))}
        </nav>
        <div aria-label="Display settings" className="display-controls">
          <button className="setting-button" onClick={() => saveSetting("saathi-large-text", !largeText)} type="button">
            {largeText ? "A−" : "A+"}<span className="sr-only"> {largeText ? "Use standard text size" : "Use larger text size"}</span>
          </button>
          <button aria-pressed={highContrast} className="setting-button" onClick={() => saveSetting("saathi-high-contrast", !highContrast)} type="button">High contrast</button>
        </div>
      </header>
      <main id="main-content" tabIndex={-1}>{children}</main>
      <footer>Saathi is a helper, not a doctor or lawyer.</footer>
    </div>
  );
}
