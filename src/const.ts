export const CARD_TAG = "school-year-card";
export const EDITOR_TAG = "school-year-card-editor";
export const CARD_TYPE = `custom:${CARD_TAG}`;

export const EVENT_APPEARANCE: Record<string, { icon: string; color: string }> = {
  autumn_break: { icon: "mdi:leaf", color: "#ff9800" },
  christmas_break: { icon: "mdi:pine-tree", color: "#ef6c5b" },
  winter_sports_break: { icon: "mdi:snowflake", color: "#42c5e8" },
  easter_break: { icon: "mdi:egg-easter", color: "#a86ee8" },
  summer_break: { icon: "mdi:white-balance-sunny", color: "#73bf64" },
  holiday: { icon: "mdi:party-popper", color: "#ec6f9e" },
  k_day: { icon: "mdi:calendar-remove-outline", color: "#78909c" },
  break: { icon: "mdi:calendar-remove-outline", color: "#607d8b" },
  closure: { icon: "mdi:calendar-remove-outline", color: "#607d8b" },
  between_terms_break: { icon: "mdi:calendar-range", color: "#607d8b" },
};

export const DEFAULT_APPEARANCE = {
  icon: "mdi:calendar-remove-outline",
  color: "#607d8b",
};
