import { beforeEach, describe, expect, it } from "vitest";

import "./index";

const entity = "sensor.school_year_status";
const hass = {
  states: {
    [entity]: {
      entity_id: entity,
      state: "School Day",
      attributes: {
        raw_status: "school_day",
        events: [{
          uid: "autumn-2026", name: "Autumn break", type: "autumn_break",
          start: "2026-10-26", end: "2026-10-30", school_closed: true,
          term: "Autumn term 2026", inferred: false,
        }],
      },
      context: { id: "1", parent_id: null, user_id: null },
      last_changed: "2026-09-06T00:00:00Z",
      last_updated: "2026-09-06T00:00:00Z",
    },
  },
  language: "en",
  locale: { language: "en" },
} as any;

describe("school-year-card", () => {
  beforeEach(() => { document.body.replaceChildren(); });

  it("registers with Home Assistant and renders backend events", async () => {
    const card = document.createElement("school-year-card") as any;
    card.setConfig({ type: "custom:school-year-card", entity });
    card.hass = hass;
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot.textContent).toContain("School year");
    expect(card.shadowRoot.textContent).toContain("Autumn break");
    expect(window.customCards?.some((item) => item.type === "school-year-card")).toBe(true);
  });

  it("renders a safe unavailable state for a missing entity", async () => {
    const card = document.createElement("school-year-card") as any;
    card.setConfig({ type: "custom:school-year-card", entity: "sensor.missing" });
    card.hass = hass;
    document.body.append(card);
    await card.updateComplete;
    expect(card.shadowRoot.textContent).toContain("unavailable");
  });

  it("exposes a standard ha-form editor", async () => {
    const ctor = customElements.get("school-year-card") as any;
    const editor = await ctor.getConfigElement() as any;
    editor.hass = hass;
    editor.setConfig({ type: "custom:school-year-card", entity });
    document.body.append(editor);
    await editor.updateComplete;
    const form = editor.shadowRoot.querySelector("ha-form") as HTMLElement & {
      data: Record<string, unknown>;
    };
    expect(form).not.toBeNull();
    expect(form.data).toMatchObject({
      show_header: true,
      show_status: true,
      show_next_break: true,
      show_countdown: true,
      show_weekday_for_single_day: true,
      compact: false,
    });
  });

  it("shows the localized weekday without a duplicate range for single-day breaks", async () => {
    const card = document.createElement("school-year-card") as any;
    card.setConfig({ type: "custom:school-year-card", entity, locale: "en" });
    card.hass = {
      ...hass,
      states: {
        [entity]: {
          ...hass.states[entity],
          attributes: {
            ...hass.states[entity].attributes,
            events: [{
              ...hass.states[entity].attributes.events[0],
              start: "2026-09-21",
              end: "2026-09-21",
            }],
          },
        },
      },
    };
    document.body.append(card);
    await card.updateComplete;
    const date = card.shadowRoot.querySelector("article.event .date").textContent;
    expect(date).toContain("Mon");
    expect(date).not.toContain("–");
  });

  it("defaults to a full section width for readable timelines", () => {
    const card = document.createElement("school-year-card") as any;
    card.setConfig({ type: "custom:school-year-card", entity });
    expect(card.getGridOptions()).toMatchObject({ columns: 12, min_columns: 6 });
  });
});
