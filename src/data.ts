import type { DisplayEvent, SchoolEvent } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseLocalDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  const result = new Date(year, month - 1, day);
  return result.getFullYear() === year && result.getMonth() === month - 1 && result.getDate() === day
    ? result
    : undefined;
}

function dayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

export function normalizeEvents(value: unknown, today = new Date()): DisplayEvent[] {
  if (!Array.isArray(value)) return [];
  const todayDay = dayNumber(today);
  return value.flatMap((candidate): DisplayEvent[] => {
    if (!candidate || typeof candidate !== "object") return [];
    const event = candidate as Partial<SchoolEvent>;
    const startDate = parseLocalDate(event.start);
    const endDate = parseLocalDate(event.end);
    if (
      typeof event.uid !== "string" ||
      typeof event.name !== "string" ||
      typeof event.type !== "string" ||
      event.school_closed !== true ||
      !startDate ||
      !endDate ||
      dayNumber(endDate) < dayNumber(startDate)
    ) return [];
    const startDay = dayNumber(startDate);
    const endDay = dayNumber(endDate);
    return [{
      ...event,
      term: typeof event.term === "string" ? event.term : null,
      inferred: event.inferred === true,
      startDate,
      endDate,
      daysUntil: Math.max(startDay - todayDay, 0),
      phase: todayDay < startDay ? "future" : todayDay > endDay ? "past" : "active",
    } as DisplayEvent];
  }).sort((left, right) => left.startDate.getTime() - right.startDate.getTime());
}

export function schoolYearLabel(events: DisplayEvent[], today = new Date()): string {
  const relevant = events.find((event) => event.phase !== "past") ?? events.at(-1);
  const pivot = relevant?.startDate ?? today;
  const startYear = pivot.getMonth() >= 6 ? pivot.getFullYear() : pivot.getFullYear() - 1;
  return `${startYear}–${startYear + 1}`;
}
