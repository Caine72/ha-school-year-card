const translations = {
  en: {
    title: "School year", today: "Today", nextBreak: "Next break", breaks: "Breaks this school year",
    days: "days", day: "day", active: "Active now", noBreaks: "No school breaks found",
    unavailable: "School Year data is unavailable", schoolDay: "School day", schoolClosed: "School closed",
    weekend: "Weekend", outsideTerm: "Outside school term", unknown: "Unknown",
  },
  sv: {
    title: "Läsår", today: "Idag", nextBreak: "Nästa lov", breaks: "Lov under läsåret",
    days: "dagar", day: "dag", active: "Pågår nu", noBreaks: "Inga skollov hittades",
    unavailable: "Läsårsdata är inte tillgänglig", schoolDay: "Skoldag", schoolClosed: "Skolan är stängd",
    weekend: "Helg", outsideTerm: "Utanför terminen", unknown: "Okänd",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function language(configured: "auto" | "en" | "sv" | undefined, hassLanguage?: string): "en" | "sv" {
  if (configured === "en" || configured === "sv") return configured;
  return hassLanguage?.toLowerCase().startsWith("sv") ? "sv" : "en";
}

export function localize(locale: "en" | "sv", key: TranslationKey): string {
  return translations[locale][key];
}
