"use client";

import { useState, useSyncExternalStore } from "react";
import { useLanguage } from "@/hooks/useLanguage";

type ReadAloudProps = {
  text: string;
  className?: string;
  label?: string;
};

function subscribeNoop() {
  return () => {};
}

function checkSpeechSynthesisSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

function getServerFalse(): boolean {
  return false;
}

export default function ReadAloud({ text, className = "", label = "Read aloud" }: ReadAloudProps) {
  const { voiceLang } = useLanguage();
  const isSupported = useSyncExternalStore(subscribeNoop, checkSpeechSynthesisSupported, getServerFalse);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isSupported || !text) {
    return null;
  }

  function toggleSpeech() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>?/gm, "").trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = voiceLang || "en-US";
    utterance.rate = 0.9; // Slower rate for senior comprehension

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }

  return (
    <button
      type="button"
      className={`setting-button read-aloud-btn ${className}`}
      onClick={toggleSpeech}
      aria-label={isSpeaking ? "Stop reading aloud" : label}
      aria-pressed={isSpeaking}
    >
      <span aria-hidden="true">{isSpeaking ? "⏹️" : "🔊"}</span>{" "}
      {isSpeaking ? "Stop Reading" : label}
    </button>
  );
}

