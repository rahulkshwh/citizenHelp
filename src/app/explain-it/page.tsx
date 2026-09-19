"use client";

import { FormEvent, useState } from "react";
import { generateIcsContent, downloadIcsFile, parseDeadlineToDate } from "@/lib/calendar";

type ExplainResult = {
  summary: string;
  asksOfMe: string;
  deadline: string;
  safeNextStep: string;
  questionsToAsk?: string[];
  trustedPersonNote: string;
};

export default function ExplainItPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) {
      setResult(null);
      setStatusMessage("Please paste the bill, letter, or medicine label text first.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStatusMessage("Reading and explaining your document. Please wait...");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "explain", text: trimmedText, lang: "en" }),
      });

      if (!response.ok) {
        throw new Error("Could not explain document.");
      }

      const data = (await response.json()) as ExplainResult;
      setResult(data);
      setStatusMessage("Explanation ready.");
    } catch {
      setResult({
        summary: "We could not explain this document right now.",
        asksOfMe: "Do not sign, pay, or share personal details until you understand it.",
        deadline: "Please check the original document for any deadline.",
        safeNextStep: "Ask a trusted family member or contact the sender using an official phone number.",
        questionsToAsk: [
          "Can you explain what this letter or bill means in simple words?",
          "Is there any payment or action needed from me, and by when?",
          "Can we verify this together using their official phone number?",
        ],
        trustedPersonNote: "For medical, legal, or financial matters, please consult a trusted professional.",
      });
      setStatusMessage("We could not complete the online check. Here is a safe guide.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleRemindMe() {
    if (!result) return;
    const targetDate = parseDeadlineToDate(result.deadline);
    const content = generateIcsContent({
      title: `Reminder: ${result.asksOfMe.slice(0, 50)}`,
      description: `Summary: ${result.summary}\nDeadline: ${result.deadline}\nSafest next step: ${result.safeNextStep}`,
      date: targetDate,
    });
    downloadIcsFile("saathi-reminder.ics", content);
    setStatusMessage("Reminder downloaded (.ics file). You can open it to add to your calendar.");
  }

  const questions =
    result?.questionsToAsk && result.questionsToAsk.length > 0
      ? result.questionsToAsk
      : [
          "Can you explain what this means in simple words?",
          "Is there any payment or action needed from me, and by when?",
          "Can we verify this together using their official phone number?",
        ];

  return (
    <section className="explain-it-page">
      <h1>Explain It</h1>
      <p>
        Paste a bill, letter, or medicine label here. We will explain what it means in plain language.
      </p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="explain-text">Document text</label>
        <textarea
          id="explain-text"
          maxLength={2000}
          rows={8}
          placeholder="Paste bill, letter, or medicine label text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="character-count">{text.length}/2000 characters</p>

        <div className="button-group">
          <button className="primary-button" type="submit" disabled={isLoading}>
            {isLoading ? "Explaining…" : "Explain in plain English"}
          </button>
          {text && (
            <button
              className="setting-button"
              type="button"
              onClick={() => {
                setText("");
                setResult(null);
                setStatusMessage("Cleared.");
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <p aria-live="polite" className="status-message">
        {statusMessage}
      </p>

      {result && (
        <article className="result-card explain-result" aria-labelledby="explain-summary-heading">
          <div>
            <h2 id="explain-summary-heading">Plain Summary</h2>
            <p className="summary-text">{result.summary}</p>

            <h3>What they want from me</h3>
            <p>{result.asksOfMe}</p>

            <h3>Deadline / Due Date</h3>
            <p>{result.deadline}</p>

            <h3>Safest next step</h3>
            <p>{result.safeNextStep}</p>

            <h3>3 Questions to ask</h3>
            <ol className="questions-list">
              {questions.slice(0, 3).map((q, idx) => (
                <li key={idx}>{q}</li>
              ))}
            </ol>

            <div className="action-buttons">
              <button
                type="button"
                className="primary-button calendar-button"
                onClick={handleRemindMe}
              >
                📅 Remind me (.ics)
              </button>
              <a className="setting-button call-family" href="tel:">
                📞 Call Family
              </a>
            </div>

            <div className="trusted-note" role="note">
              <p>
                <strong>Disclaimer:</strong> Saathi is a helper, not a doctor or lawyer. {result.trustedPersonNote}
              </p>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

