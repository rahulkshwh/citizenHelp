"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import {
  useMedicines,
  getMedicineStatus,
  formatTimeDisplay,
  isMedicineTakenToday,
} from "@/lib/medicines";
import { getDailyScamTip } from "@/lib/scam-tips";
import ReadAloud from "@/components/read-aloud";
import VoiceInput from "@/components/voice-input";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! ☀️";
  if (hour < 17) return "Good afternoon! 🌤️";
  return "Good evening! 🌙";
}

function getVoiceAssistantAnswer(
  query: string,
  nextMed: ReturnType<typeof getMedicineStatus>["nextMed"],
  missedMeds: ReturnType<typeof getMedicineStatus>["missedMeds"],
): { text: string; actionHref?: string; actionLabel?: string } {
  const q = query.toLowerCase();

  if (
    q.includes("medicine") ||
    q.includes("pill") ||
    q.includes("dose") ||
    q.includes("tablet") ||
    q.includes("medication")
  ) {
    if (missedMeds.length > 0) {
      return {
        text: `You have ${missedMeds.length} missed medicine dose: ${missedMeds.map((m) => m.name).join(", ")}. Please review your medicines schedule.`,
        actionHref: "/medicines",
        actionLabel: "Open Medicines Schedule →",
      };
    }
    if (nextMed) {
      return {
        text: `Your next medicine is ${nextMed.name} (${nextMed.dosage}) scheduled for ${formatTimeDisplay(nextMed.time)}.`,
        actionHref: "/medicines",
        actionLabel: "View Medicine Schedule →",
      };
    }
    return {
      text: "All your medicines for today are marked as taken! You are all set.",
      actionHref: "/medicines",
      actionLabel: "Check Medicine List →",
    };
  }

  if (
    q.includes("scam") ||
    q.includes("fraud") ||
    q.includes("suspicious") ||
    q.includes("otp") ||
    q.includes("pin") ||
    q.includes("lottery") ||
    q.includes("prize") ||
    q.includes("urgent") ||
    q.includes("arrest") ||
    q.includes("fake")
  ) {
    return {
      text: "Be very careful! Scammers often create urgency or ask for OTPs, PINs, or money. Never share private details. Let's inspect the message in Scam Shield.",
      actionHref: `/scam-shield?text=${encodeURIComponent(query)}`,
      actionLabel: "Check in Scam Shield →",
    };
  }

  if (
    q.includes("explain") ||
    q.includes("bill") ||
    q.includes("letter") ||
    q.includes("notice") ||
    q.includes("document") ||
    q.includes("paper")
  ) {
    return {
      text: "I can help explain confusing letters, bills, and documents in simple words with clear deadlines. Let's open Explain It.",
      actionHref: `/explain-it?text=${encodeURIComponent(query)}`,
      actionLabel: "Open Explain It →",
    };
  }

  if (
    q.includes("family") ||
    q.includes("daughter") ||
    q.includes("son") ||
    q.includes("call") ||
    q.includes("phone") ||
    q.includes("whatsapp") ||
    q.includes("doctor")
  ) {
    return {
      text: "You can reach your loved ones with one touch using phone or WhatsApp, or have me help write a message for them.",
      actionHref: "/family",
      actionLabel: "Open Family & Contacts →",
    };
  }

  return {
    text: `I heard: "${query}". I am Saathi, your companion for scam checks, explaining letters, tracking medicines, and reaching family. What would you like help with?`,
  };
}

export default function TodayPage() {
  const { medicines, toggleMedicineTaken } = useMedicines();
  const greeting = getGreeting();
  const scamTip = getDailyScamTip();

  const { nextMed, missedMeds } = getMedicineStatus(medicines);

  const [inputQuery, setInputQuery] = useState("");
  const [assistantResult, setAssistantResult] = useState<{
    text: string;
    actionHref?: string;
    actionLabel?: string;
  } | null>(null);

  const todaySummarySpeech = [
    greeting,
    missedMeds.length > 0
      ? `Attention: You have ${missedMeds.length} missed medicine doses.`
      : "",
    nextMed
      ? `Your next scheduled medicine is ${nextMed.name}, ${nextMed.dosage}, at ${formatTimeDisplay(nextMed.time)}.`
      : "All your medicines for today are marked as taken.",
    `Daily scam safety tip: ${scamTip.title}. ${scamTip.tip}`,
  ]
    .filter(Boolean)
    .join(" ");

  function handleQuerySubmit(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setInputQuery(trimmed);
    const result = getVoiceAssistantAnswer(trimmed, nextMed, missedMeds);
    setAssistantResult(result);
  }

  function onFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleQuerySubmit(inputQuery);
  }

  return (
    <div className="today-page">
      <header className="greeting-header">
        <div className="greeting-row">
          <div>
            <h1>{greeting}</h1>
            <p className="subheading">Here is your daily check-in for peace of mind.</p>
          </div>
          <ReadAloud text={todaySummarySpeech} label="Listen to Today's Summary" />
        </div>
      </header>

      {/* Voice Assistant & Spoken Help Section */}
      <section className="section-card voice-assistant-section" aria-labelledby="voice-assistant-heading">
        <h2 id="voice-assistant-heading">🎙️ Voice Assistant & Spoken Help</h2>
        <p className="voice-assistant-desc">
          Tap the microphone to speak, or type your question below. Saathi will guide you and speak the answer back.
        </p>

        <form onSubmit={onFormSubmit} className="voice-controls">
          <VoiceInput
            label="Speak to Saathi"
            onTranscript={(transcript) => handleQuerySubmit(transcript)}
          />
          <label htmlFor="home-voice-input" className="sr-only">
            Type a question for Saathi
          </label>
          <input
            id="home-voice-input"
            type="text"
            className="voice-assistant-input"
            placeholder="e.g. Did I take my pill? or Check a scam text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
          />
          <button type="submit" className="primary-button">
            Ask
          </button>
        </form>

        <p className="voice-suggestions-label">Try asking:</p>
        <div className="voice-chips">
          <button
            type="button"
            className="setting-button voice-chip-btn"
            onClick={() => handleQuerySubmit("Did I take my medicine today?")}
          >
            💊 Did I take my pill?
          </button>
          <button
            type="button"
            className="setting-button voice-chip-btn"
            onClick={() => handleQuerySubmit("I got a suspicious text message")}
          >
            🛡️ Check suspicious text
          </button>
          <button
            type="button"
            className="setting-button voice-chip-btn"
            onClick={() => handleQuerySubmit("Explain an official letter or bill")}
          >
            📄 Explain a bill or letter
          </button>
          <button
            type="button"
            className="setting-button voice-chip-btn"
            onClick={() => handleQuerySubmit("Call or message my family")}
          >
            👨‍👩‍👧 Call my family
          </button>
        </div>

        {assistantResult && (
          <div className="voice-assistant-result" role="region" aria-live="polite">
            <div className="voice-result-header">
              <h3>Saathi Assistant</h3>
              <ReadAloud text={assistantResult.text} label="Hear Answer Aloud" />
            </div>
            <p className="voice-result-text">{assistantResult.text}</p>
            {assistantResult.actionHref && assistantResult.actionLabel && (
              <div className="voice-action-row">
                <Link href={assistantResult.actionHref} className="primary-button">
                  {assistantResult.actionLabel}
                </Link>
              </div>
            )}
          </div>
        )}
      </section>

      {missedMeds.length > 0 && (
        <div className="alert-card alert-warning" role="alert" aria-live="assertive">
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
        </div>
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
