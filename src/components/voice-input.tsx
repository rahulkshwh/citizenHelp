"use client";

import { useState, useSyncExternalStore } from "react";

type VoiceInputProps = {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
};

function subscribeNoop() {
  return () => {};
}

function checkSpeechRecognitionSupported(): boolean {
  return typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
}

function getServerFalse(): boolean {
  return false;
}

export default function VoiceInput({ onTranscript, className = "", disabled = false }: VoiceInputProps) {
  const isSupported = useSyncExternalStore(subscribeNoop, checkSpeechRecognitionSupported, getServerFalse);
  const [isListening, setIsListening] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");

  if (!isSupported) {
    return null; // Gracefully hidden if browser does not support SpeechRecognition
  }

  function toggleListening() {
    if (isListening) {
      setIsListening(false);
      setVoiceStatus("Microphone stopped.");
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognitionClass) return;

      const recognition = new SpeechRecognitionClass();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsListening(true);
      setVoiceStatus("Listening... Speak now.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          onTranscript(transcript);
          setVoiceStatus("Speech converted to text.");
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setVoiceStatus("Could not hear speech clearly. Try again or type.");
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setVoiceStatus("Microphone access error. Please check permissions.");
      setIsListening(false);
    }
  }

  return (
    <div className="voice-input-container">
      <button
        type="button"
        className={`setting-button voice-input-btn ${className}`}
        onClick={toggleListening}
        disabled={disabled}
        aria-label={isListening ? "Stop listening to microphone" : "Dictate using microphone"}
        aria-pressed={isListening}
      >
        <span aria-hidden="true">{isListening ? "⏹️" : "🎙️"}</span>{" "}
        {isListening ? "Listening…" : "Dictate"}
      </button>
      {voiceStatus && (
        <span className="sr-only" aria-live="polite">
          {voiceStatus}
        </span>
      )}
    </div>
  );
}

