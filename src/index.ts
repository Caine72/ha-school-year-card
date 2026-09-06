import "./editor";
import "./card";
import { CARD_TAG } from "./const";

declare global {
  interface Window { customCards?: Array<Record<string, unknown>>; }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: "School Year Card",
    description: "A timeline of school breaks from the School Year integration",
    preview: true,
    documentationURL: "https://github.com/Caine72/ha-school-year-card",
  });
}
