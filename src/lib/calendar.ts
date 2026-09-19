export function generateIcsContent({
  title,
  description,
  date,
}: {
  title: string;
  description: string;
  date?: Date;
}): string {
  const eventDate = date || new Date(Date.now() + 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = eventDate.getFullYear();
  const month = pad(eventDate.getMonth() + 1);
  const day = pad(eventDate.getDate());
  const dateStr = `${year}${month}${day}`;

  const cleanTitle = title.replace(/[\r\n]+/g, " ").trim();
  const cleanDesc = description.replace(/[\r\n]+/g, "\\n").trim();
  const uid = `saathi-${Date.now()}@saathi.local`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Saathi//Companion App//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dateStr}T090000Z`,
    `DTSTART;VALUE=DATE:${dateStr}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function downloadIcsFile(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".ics") ? filename : `${filename}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

