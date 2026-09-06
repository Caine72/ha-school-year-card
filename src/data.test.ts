import { describe, expect, it } from "vitest";

import { normalizeEvents, parseLocalDate, schoolYearLabel } from "./data";

const event = (overrides: Record<string, unknown> = {}) => ({
  uid: "autumn-2026", name: "Autumn break", type: "autumn_break",
  start: "2026-10-26", end: "2026-10-30", school_closed: true,
  term: "Autumn term 2026", inferred: false, ...overrides,
});

describe("normalizeEvents", () => {
  it("filters unsafe data and sorts closures", () => {
    const result = normalizeEvents([
      event({ uid: "winter", name: "Winter break", start: "2027-02-08", end: "2027-02-12" }),
      event(),
      event({ uid: "term", school_closed: false }),
      event({ uid: "invalid", end: "not-a-date" }),
    ], new Date(2026, 8, 6));
    expect(result.map(({ uid }) => uid)).toEqual(["autumn-2026", "winter"]);
    expect(result[0]).toMatchObject({ daysUntil: 50, phase: "future" });
  });

  it("marks active and past events at inclusive boundaries", () => {
    expect(normalizeEvents([event()], new Date(2026, 9, 30))[0].phase).toBe("active");
    expect(normalizeEvents([event()], new Date(2026, 9, 31))[0].phase).toBe("past");
  });
});

describe("date helpers", () => {
  it("rejects normalized-looking but impossible dates", () => {
    expect(parseLocalDate("2026-02-30")).toBeUndefined();
  });

  it("labels the school year around the calendar-year boundary", () => {
    const events = normalizeEvents([event()], new Date(2026, 8, 6));
    expect(schoolYearLabel(events)).toBe("2026–2027");
  });
});
