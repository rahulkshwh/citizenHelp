"use client";

import { FormEvent, useState } from "react";
import { generateIcsContent, downloadIcsFile } from "@/lib/calendar";

type ExplainResult = {
  summary: string;
  asksOfMe: string;
  deadline: string;
  safeNextStep: string;
  trustedPersonNote: string;
};

export default function ExplainItPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExplainResult | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  function startVoiceInput() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage("Voice input is not supported in this browser.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setStatusMessage("Listening... Speak now.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript).slice(0, 2000));
        setStatusMessage("Voice input received.");
        setIsListening(false);
      };

      recognition.onerror = () => {
        setStatusMessage("Could not hear speech. Please try again or type.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setStatusMessage("Could not start microphone.");
      setIsListening(false);
    }
  }

  function readAloud() {
    if (!result || typeof window === "undefined" || !("speechSynthesis" in window)) {
      setStatusMessage("Read aloud is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const textToRead = `Summary: ${result.summary}. What it asks of you: ${result.asksOfMe}. Deadline: ${result.deadline}. Next step: ${result.safeNextStep}. ${result.trustedPersonNote}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9; // Slightly slower for clarity
    window.speechSynthesis.speak(utterance);
    setStatusMessage("Reading aloud...");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) {
      setResult(null);
      setStatusMessage("Please paste or dictate your bill, letter, or medicine label first.");
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStatusMessage("Reading and explaining your document. Please wait.");

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
        deadline: "Please check the original document for any date or deadline.",
        safeNextStep: "Ask a trusted family member or contact the sender using an official phone number.",
        trustedPersonNote: "For medical, legal, or financial matters, please consult a trusted professional.",
      });
      setStatusMessage("We could not complete the online check. Here is a safe guide.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleDownloadReminder() {
    if (!result) return;
    const content = generateIcsContent({
      title: `Reminder: ${result.asksOfMe.slice(0, 50)}`,
      description: `Summary: ${result.summary}\nDeadline: ${result.deadline}\nNext step: ${result.safeNextStep}`,
    });
    downloadIcsFile("saathi-reminder.ics", content);
    setStatusMessage("Calendar reminder file downloaded.");
  }

  return (
    <section className="explain-it-page">
      <h1>Explain It</h1>
      <p>
        Paste a bill, letter, or medicine label here. We will explain what it means in plain language.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <label htmlFor="explain-text">Your document text</label>
          <button
            type="button"
            className="setting-button voice-button"
            onClick={startVoiceInput}
            disabled={isListening || isLoading}
            aria-label={isListening ? "Listening to microphone" : "Dictate text using microphone"}
          >
            {isListening ? "🎙️ Listening…" : "🎙️ Dictate"}
          </button>
        </div>

        <textarea
          id="explain-text"
          maxLength={2000}
          rows={8}
          placeholder="Paste or dictate letter, bill, or medicine label text here..."
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
            <div className="result-header">
              <h2 id="explain-summary-heading">Plain Summary</h2>
              <button
                type="button"
                className="setting-button read-aloud-button"
                onClick={readAloud}
                aria-label="Read explanation aloud"
              >
                🔊 Read Aloud
              </button>
            </div>

            <p className="summary-text">{result.summary}</p>

            <h3>What it asks of me</h3>
            <p>{result.asksOfMe}</p>

            <h3>Deadline / Due Date</h3>
            <p>{result.deadline}</p>

            <h3>Safe next step</h3>
            <p>{result.safeNextStep}</p>

            <div className="trusted-note">
              <p>
                <strong>Important note:</strong> {result.trustedPersonNote}
              </p>
            </div>

            <div className="action-buttons">
              <button
                type="button"
                className="primary-button calendar-button"
                onClick={handleDownloadReminder}
              >
                📅 Add Calendar Reminder (.ics)
              </button>
              <a className="setting-button call-family" href="tel:">
                📞 Call Family
              </a>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}

