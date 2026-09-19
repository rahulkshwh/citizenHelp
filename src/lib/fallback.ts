import type { AiMode, AiResponse } from "./schemas";

const fallbacks: Record<AiMode, AiResponse> = {
  scam: {
    verdict: "Suspicious",
    why: "We could not check this message right now. Treat unexpected requests for money, personal details, or urgent action with care.",
    whatToDo: [
      "Do not share an OTP, PIN, password, or bank details.",
      "Do not click links or call numbers in the message.",
      "Ask a trusted person to check it with you.",
    ],
    trustedPersonNote: "If money or personal information may be at risk, contact your bank or service provider using an official number.",
  },
  explain: {
    summary: "We could not explain this document right now.",
    asksOfMe: "Do not sign, pay, or share personal details until you understand it.",
    deadline: "Please check the original document for any deadline.",
    safeNextStep: "Ask a trusted person or the organisation that sent it to explain it using an official contact method.",
    trustedPersonNote: "For medical, legal, or financial matters, speak with a qualified professional.",
  },
  family: {
    message: "Hello, could you please help me understand this when you have time?",
    safeNextStep: "Share only what you are comfortable sharing and ask a trusted family member or friend for help.",
  },
};

export function getFallback(mode: AiMode): AiResponse {
  return fallbacks[mode];
}
