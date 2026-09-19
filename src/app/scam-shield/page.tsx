"use client";

import { FormEvent, useState } from "react";
import { HIGH_RISK_SCORE, LOW_RISK_SCORE, scoreScamText } from "@/lib/heuristics";

type Verdict = "Safe" | "Suspicious" | "Dangerous";
type ScamResult = {
  verdict: Verdict;
  why: string;
  whatToDo: string[];
  trustedPersonNote: string;
};

const verdictIcon: Record<Verdict, string> = {
  Safe: "✓",
  Suspicious: "!",
  Dangerous: "⚠",
};

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
    why: `We found high-risk scam warning signs: ${signals.join(", ")}.`,
    whatToDo: [
      "Do not reply, click links, or call numbers in the message.",
      "Do not share an OTP, PIN, password, or bank details.",
      "Talk to a trusted family member or contact the organisation using its official phone number.",
    ],
    trustedPersonNote:
      "If you already shared money or private information, contact your bank immediately using its official number.",
  };
}

export default function ScamShieldPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ScamResult | null>(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function checkMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) {
      setResult(null);
      setMessage("Please paste or describe the message first.");
      return;
    }

    const heuristic = scoreScamText(trimmedText);

    // Rule-first evaluation:
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

    // Between low and high: call LLM /api/ai
    setIsLoading(true);
    setResult(null);
    setMessage("Checking for scam signs. Please wait.");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "scam", text: trimmedText, lang: "en" }),
      });

      if (!response.ok) {
        throw new Error("The check could not be completed.");
      }

      const data = (await response.json()) as ScamResult;
      setResult(data);
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
        <label htmlFor="scam-text">Message or call description</label>
        <textarea
          id="scam-text"
          maxLength={2000}
          rows={8}
          placeholder="Paste the message or describe the phone call here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
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
            <h2 id="verdict">{result.verdict}</h2>

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
