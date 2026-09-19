export const DAILY_SCAM_TIPS = [
  {
    title: "Banks never ask for OTP or PIN",
    tip: "No legitimate bank, police officer, or government official will ever ask for your PIN, OTP, or internet banking password. If anyone asks, hang up.",
  },
  {
    title: "Beware of urgent parcel delivery texts",
    tip: "Scammers send fake texts claiming 'Your package is on hold, pay £2 fee'. Never click links in unexpected parcel text messages.",
  },
  {
    title: "Electricity or water disconnection threats",
    tip: "Callers threatening immediate power cutoff unless you pay right now are scammers. Utility companies always send postal notices first.",
  },
  {
    title: "Fake family emergency messages",
    tip: "If a text arrives from an unknown number saying 'Hi Mum/Dad, I lost my phone, please send money', call your child on their known number before sending anything.",
  },
  {
    title: "Gift card or cryptocurrency payment requests",
    tip: "No real company or government department accepts payment in Apple gift cards, Amazon vouchers, or Bitcoin.",
  },
  {
    title: "Unsolicited computer repair calls",
    tip: "Callers claiming to be from Microsoft or your internet provider warning of a virus on your computer are fraudsters. Never give remote access.",
  },
  {
    title: "Too-good-to-be-true lottery or sweepstakes",
    tip: "You cannot win a lottery or prize you never entered. Never pay 'tax' or 'clearance fees' to claim a prize.",
  },
];

export function getDailyScamTip(date = new Date()) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24,
  );
  return DAILY_SCAM_TIPS[Math.abs(dayOfYear) % DAILY_SCAM_TIPS.length];
}

