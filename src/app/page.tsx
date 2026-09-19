"use client";

import Link from "next/link";
import {
  useMedicines,
  getMedicineStatus,
  formatTimeDisplay,
  isMedicineTakenToday,
} from "@/lib/medicines";
import { getDailyScamTip } from "@/lib/scam-tips";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! ☀️";
  if (hour < 17) return "Good afternoon! 🌤️";
  return "Good evening! 🌙";
}

export default function TodayPage() {
  const { medicines, toggleMedicineTaken } = useMedicines();
  const greeting = getGreeting();
  const scamTip = getDailyScamTip();

  const { nextMed, missedMeds } = getMedicineStatus(medicines);

  return (
    <div className="today-page">
      <header className="greeting-header">
        <h1>{greeting}</h1>
        <p className="subheading">Here is your daily check-in for peace of mind.</p>
      </header>

      {missedMeds.length > 0 && (
        <aside className="alert-card alert-warning" role="alert" aria-live="assertive">
          <div className="alert-icon" aria-hidden="true">⚠️</div>
          <div>
            <h2>Missed Medicine Reminder</h2>
            {missedMeds.map((med) => (
              <div key={med.id} className="missed-item">
                <p>
                  <strong>{med.name}</strong> ({med.dosage}) was scheduled for{" "}
                  <strong>{formatTimeDisplay(med.time)}</strong>.
                </p>
                <button
                  type="button"
                  className="primary-button take-button"
                  onClick={() => toggleMedicineTaken(med.id)}
                >
                  Mark as Taken Now
                </button>
              </div>
            ))}
          </div>
        </aside>
      )}

      <section className="section-card next-med-section" aria-labelledby="next-med-heading">
        <h2 id="next-med-heading">💊 Next Medicine</h2>
        {nextMed ? (
          <div className="next-med-content">
            <div className="med-info">
              <p className="med-name">{nextMed.name}</p>
              <p className="med-meta">
                <span><strong>Dose:</strong> {nextMed.dosage}</span>
                <span> • </span>
                <span><strong>Scheduled:</strong> {formatTimeDisplay(nextMed.time)}</span>
              </p>
              {nextMed.instructions && (
                <p className="med-instructions">ℹ️ {nextMed.instructions}</p>
              )}
            </div>
            <button
              type="button"
              className={`primary-button big-action-button ${
                isMedicineTakenToday(nextMed) ? "button-taken" : ""
              }`}
              onClick={() => toggleMedicineTaken(nextMed.id)}
            >
              {isMedicineTakenToday(nextMed) ? "✓ Taken Today" : "Mark as Taken"}
            </button>
          </div>
        ) : (
          <div className="all-meds-taken">
            <p>🎉 All your medicines for today are marked as taken! Well done.</p>
          </div>
        )}
        <div className="meds-link-container">
          <Link href="/medicines" className="setting-button">
            View full medicine schedule →
          </Link>
        </div>
      </section>

      <section className="section-card scam-tip-section" aria-labelledby="scam-tip-heading">
        <h2 id="scam-tip-heading">🛡️ Daily Scam Safety Tip</h2>
        <h3 className="scam-tip-title">{scamTip.title}</h3>
        <p className="scam-tip-body">{scamTip.tip}</p>
        <Link href="/scam-shield" className="setting-button">
          Check a message with Scam Shield →
        </Link>
      </section>

      <section className="quick-shortcuts" aria-label="Quick shortcuts">
        <Link href="/scam-shield" className="shortcut-card">
          <span className="shortcut-icon" aria-hidden="true">🛡️</span>
          <div>
            <h3>Scam Shield</h3>
            <p>Check a suspicious text, call, or email</p>
          </div>
        </Link>
        <Link href="/explain-it" className="shortcut-card">
          <span className="shortcut-icon" aria-hidden="true">📄</span>
          <div>
            <h3>Explain It</h3>
            <p>Make sense of a letter, bill, or medicine label</p>
          </div>
        </Link>
        <Link href="/family" className="shortcut-card">
          <span className="shortcut-icon" aria-hidden="true">👨‍👩‍👧</span>
          <div>
            <h3>Family</h3>
            <p>Quick call, WhatsApp, or draft a message</p>
          </div>
        </Link>
      </section>
    </div>
  );
}
