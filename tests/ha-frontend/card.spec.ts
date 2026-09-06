import { expect, test } from "@playwright/test";
import { fileURLToPath } from "node:url";

const bundlePath = fileURLToPath(new URL("../../dist/ha-school-year-card.js", import.meta.url));

test("registers the card and standard editor in Home Assistant", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.addScriptTag({ path: bundlePath });

  const result = await page.evaluate(async () => {
    const entity = "sensor.school_year_status";
    const hass = {
      states: { [entity]: { state: "School Day", attributes: { raw_status: "school_day", events: [{
        uid: "autumn-2026", name: "Autumn break", type: "autumn_break", start: "2026-10-26",
        end: "2026-10-30", school_closed: true, term: "Autumn term 2026", inferred: false,
      }] } } },
      language: "en", locale: { language: "en" },
    };
    const card = document.createElement("school-year-card") as any;
    card.style.display = "block";
    card.style.width = "360px";
    card.setConfig({ type: "custom:school-year-card", entity });
    card.hass = hass;
    document.body.append(card);
    await card.updateComplete;
    const cardRect = card.shadowRoot?.querySelector("ha-card")?.getBoundingClientRect();
    const eventRect = card.shadowRoot?.querySelector("article.event")?.getBoundingClientRect();
    const metricRect = card.shadowRoot?.querySelector("article.event .metric")?.getBoundingClientRect();
    const ctor = customElements.get("school-year-card") as any;
    const editor = await ctor.getConfigElement();
    editor.hass = hass;
    editor.setConfig({ type: "custom:school-year-card", entity });
    document.body.append(editor);
    await editor.updateComplete;
    return {
      text: card.shadowRoot?.textContent ?? "",
      hasCard: Boolean(card.shadowRoot?.querySelector("ha-card")),
      hasForm: Boolean(editor.shadowRoot?.querySelector("ha-form")),
      timelineFits: Boolean(
        cardRect && eventRect && metricRect &&
        eventRect.right <= cardRect.right && metricRect.right < cardRect.right &&
        metricRect.left >= eventRect.left
      ),
    };
  });

  expect(result.text).toContain("Autumn break");
  expect(result.hasCard).toBe(true);
  expect(result.hasForm).toBe(true);
  expect(result.timelineFits).toBe(true);
  expect(errors).toEqual([]);
});
