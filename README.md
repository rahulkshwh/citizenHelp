# Saathi (साथी) — GenAI Companion for Seniors

Saathi is an accessible, trustworthy, and simple companion designed specifically for older adults. Rather than an open-ended conversational chatbot, Saathi provides focused, safety-first tools to help seniors navigate the digital and physical world with confidence.

---

## Key Modules

1. **Today (`/`)**
   - **Time-based greeting:** Friendly, calming context (morning, afternoon, evening).
   - **Next scheduled medicine:** Highlights what medicine is due with a single-tap "Taken" button.
   - **Missed-dose alerts:** Prominently alerts when a scheduled medicine dose has been missed.
   - **Daily scam tip:** Daily rotating scam warning to build everyday resilience.
   - **Quick shortcuts:** Rapid navigation to core tasks.

2. **Scam Shield (`/scam-shield`)**
   - Paste or dictate any suspicious text, email, or call description.
   - **Two-tier evaluation:** Rule-based heuristics run first; if ambiguous, Google Gemini 2.5 evaluates with strict JSON schemas.
   - Clear tri-state verdict: **Safe (✓)**, **Suspicious (!)**, or **Dangerous (⚠)**.
   - Practical, non-judgmental next steps and direct button to call family.

3. **Explain It (`/explain-it`)**
   - Paste or dictate confusing letters, medical bills, utility statements, or prescription labels.
   - Generates an explanation calibrated for a 12-year-old reading age.
   - Extracts:
     - Plain summary
     - What is being asked of the senior
     - Due date / deadline
     - Safe next action
   - **Calendar integration:** One-click download of `.ics` calendar reminder files.
   - **Read aloud:** Built-in text-to-speech button.

4. **Medicines (`/medicines`)**
   - Senior-friendly medicine tracker stored entirely in local device storage.
   - Large, accessible "Mark Taken" buttons with visual and text feedback.
   - Ability to add new medicines, customize dosages, set reminder times, and delete entries.

5. **Family (`/family`)**
   - Dedicated contacts hub with large single-touch **Call** (`tel:`) and **WhatsApp** (`wa.me`) buttons.
   - **"Help me write a message"**: Senior enters what they want to communicate, and Gemini drafts a polite, clear message for family members.
   - One-touch send directly into WhatsApp or copy to clipboard.

---

## Security & Architecture Principles

- **Zero Server-Side Personal Data:** No personal data, contacts, or medicine schedules are stored on any database or server. Everything stays on the senior's device (`localStorage`).
- **Prompt Injection Defense:** User input is strictly treated as untrusted data wrapped in `<user_text>` tags. System instructions command the model to ignore instructions inside user data.
- **Strict Response Schemas:** All AI interactions use typed schemas with `@google/genai` `responseSchema` and Zod validation.
- **Fail-Safe Fallbacks & Rate Limiting:** In-memory IP rate limiting protects the API from abuse. When the network is offline, rate-limited, or Gemini returns an error, deterministic rule-based fallbacks ensure the senior is never left with a blank or broken screen.
- **Security Headers:** Strict Content Security Policy (CSP), HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict `Permissions-Policy`.

---

## Accessibility (A11y)

- **Base typography:** 20px base font size for effortless readability.
- **Touch targets:** All interactive buttons and links have a minimum height of 48px.
- **High-contrast mode:** Dedicated toggle providing a pure high-contrast palette exceeding WCAG AAA contrast ratios.
- **Text sizing toggle:** Dynamic A+ / A- font size toggle with persistent state.
- **Voice input & Read aloud:** Built-in Web Speech API integration for speech dictation and speech synthesis.
- **Motion sensitivity:** Supports `prefers-reduced-motion: reduce`.
- **Screen readers:** Accessible semantic HTML, skip navigation link, explicit focus outlines, and `aria-live` region status updates.

---

## Getting Started

### Prerequisites
- Node.js 20+ LTS
- npm

### Installation
```bash
npm install
```

### Environment Configuration
Create `.env.local`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

### Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm start
```
