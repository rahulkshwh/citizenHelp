"use client";

import { FormEvent, useState } from "react";
import { HIGH_RISK_SCORE, LOW_RISK_SCORE, scoreScamText } from "@/lib/heuristics";

type Verdict = "Safe" | "Suspicious" | "Dangerous";
type ScamResult = { verdict: Verdict; why: string; whatToDo: string[]; trustedPersonNote: string };

const verdictIcon: Record<Verdict, string> = { Safe: "✓", Suspicious: "!", Dangerous: "⚠" };

function localResult(verdict: Verdict, signals: string[]): ScamResult {
  if (verdict === "Safe") {
    return {
      verdict,
      why: "This message does not show the common scam signals we check for.",
      whatToDo: [
        "Stay careful with unexpected messages.",
        "Never share an OTP, PIN, password, or bank details.",
        "Ask someone you trust if anything feels unusual.",
      ],
      trustedPersonNote: "A careful second opinion is always okay.",
    };
  }

  return {
    verdict,
    why: `We found these warning signs: ${signals.join(", ")}.`,
    whatToDo: [
      "Do not reply, click links, or call numbers in the message.",
      "Do not share an OTP, PIN, password, or bank details.",
      "Talk to a trusted family member or contact the organisation using its official number.",
    ],
    trustedPersonNote:
      "If you already shared money or private information, contact your bank using its official number.",
  };
}

export default function ScamShieldPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScamResult | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  function startVoiceInput() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessage("Voice input is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setMessage("Listening... Speak now.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 2000));
        setMessage("Voice input received.");
        setIsListening(false);
      };

      recognition.onerror = () => {
        setMessage("Could not hear speech. Please try again or type.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setMessage("Could not start microphone.");
      setIsListening(false);
    }
  }

  function readAloud() {
    if (!result || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setMessage("Read aloud is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const toRead = `Verdict: ${result.verdict}. Why: ${result.why}. What to do now: ${result.whatToDo.join(". ")}. ${result.trustedPersonNote}`;
    const utterance = new SpeechSynthesisUtterance(toRead);
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    setMessage("Reading verdict aloud...");
  }

  async function checkMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) {
      setResult(null);
      setMessage("Please paste or describe the message first.");
      return;
    }

    const heuristic = scoreScamText(trimmedText);
    if (heuristic.score < LOW_RISK_SCORE) {
      setResult(localResult("Safe", heuristic.signals));
      setMessage("Check complete.");
      return;
    }
    if (heuristic.score >= HIGH_RISK_SCORE) {
      setResult(localResult("Dangerous", heuristic.signals));
      setMessage("Check complete.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setMessage("Checking for scam signs. Please wait.");
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "scam", text: trimmedText, lang: "en" }),
      });
      if (!response.ok) throw new Error("The check could not be completed.");
      setResult((await response.json()) as ScamResult);
      setMessage("Check complete.");
    } catch {
      setResult(localResult("Suspicious", heuristic.signals));
      setMessage("We could not complete the online check. Please treat this message with care.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="scam-shield">
      <h1>Scam Shield</h1>
      <p>Paste a message or describe a call. We will look for common scam warning signs.</p>
      <form onSubmit={checkMessage}>
        <div className="form-header">
          <label htmlFor="scam-text">Message or call description</label>
          <button
            type="button"
            className="setting-button voice-button"
            onClick={startVoiceInput}
            disabled={isListening || isLoading}
            aria-label={isListening ? "Listening to microphone" : "Dictate message"}
          >
            {isListening ? "🎙️ Listening…" : "🎙️ Dictate"}
          </button>
        </div>
        <textarea
          id="scam-text"
          maxLength={2000}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste the message here"
          rows={8}
          value={text}
        />
        <p className="character-count">{text.length}/2000 characters</p>
        <div className="button-group">
          <button className="primary-button" disabled={isLoading} type="submit">
            {isLoading ? "Checking…" : "Check"}
          </button>
          {text && (
            <button
              className="setting-button"
              type="button"
              onClick={() => {
                setText("");
                setResult(null);
                setMessage("Cleared.");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
      <p aria-live="polite" className="status-message">
        {message}
      </p>
      {result && (
        <article
          className={`result-card result-${result.verdict.toLowerCase()}`}
          aria-labelledby="verdict"
        >
          <div aria-hidden="true" className="verdict-icon">
            {verdictIcon[result.verdict]}
          </div>
          <div>
            <div className="result-header">
              <h2 id="verdict">{result.verdict}</h2>
              <button
                type="button"
                className="setting-button read-aloud-button"
                onClick={readAloud}
                aria-label="Read verdict aloud"
              >
                🔊 Read Aloud
              </button>
            </div>
            <h3>Why</h3>
            <p>{result.why}</p>
            <h3>What to do now</h3>
            <ol>
              {result.whatToDo.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p>{result.trustedPersonNote}</p>
            <a className="primary-button call-family" href="tel:">
              Call my family
            </a>
          </div>
        </article>
      )}
    </section>
  );
}
