export const LOW_RISK_SCORE = 3;
export const HIGH_RISK_SCORE = 7;

type ScamRule = { label: string; pattern: RegExp; score: number };

const scamRules: ScamRule[] = [
  { label: "Urgent pressure", pattern: /\b(urgent|immediately|act now|final warning|today only|within \d+ (minutes?|hours?)|urgente|urgencia|तुरंत|जल्द|अंतिम चेतावनी)\b/i, score: 2 },
  { label: "Request for an OTP, PIN, password, or CVV", pattern: /\b(otp|one[- ]?time passcode|pin|password|cvv|contraseña|clave|ओटीपी|पिन|पासवर्ड)\b/i, score: 4 },
  { label: "Prize or lottery claim", pattern: /\b(prize|lottery|winner|won|jackpot|free gift|premio|ganador|sorteo|इनाम|लॉटरी|विजेता)\b/i, score: 2 },
  { label: "Remote-access app request", pattern: /\b(anydesk|teamviewer|quick support|remote access|screen share|acceso remoto|एनीडेस्क)\b/i, score: 3 },
  { label: "Gift card, UPI, or crypto payment", pattern: /\b(gift card|upi|crypto|bitcoin|usdt|voucher|tarjeta de regalo|गिफ्ट कार्ड|यूपीआई|क्रिप्टो)\b/i, score: 3 },
  { label: "Threat of arrest, disconnection, or account action", pattern: /\b(arrest|police case|account (?:will be )?blocked|disconnection|disconnect(?:ed|ion)?|legal action|warrant|bloqueo|arresto|corte de luz|बिजली कट|ब्लॉक|अरेस्ट|पुलिस केस)\b/i, score: 3 },
  { label: "Suspicious link", pattern: /\b(https?:\/\/|www\.|bit\.ly|tinyurl\.com|click here|clic aquí|क्लिक करें)\b/i, score: 2 },
  { label: "Claim to be a bank or government authority", pattern: /\b(bank|income tax|government|aadhaar|rbi|police|customs|electricity department|banco|policía|gobierno|बैंक|आधार|पुलिस|सरकार|बिजली विभाग)\b/i, score: 2 },
];

export type HeuristicResult = { score: number; signals: string[] };

export function scoreScamText(text: string): HeuristicResult {
  const matches = scamRules.filter((rule) => rule.pattern.test(text));
  return { score: matches.reduce((total, rule) => total + rule.score, 0), signals: matches.map((rule) => rule.label) };
}
