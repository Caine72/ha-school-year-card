import type { SchoolYearCardConfig } from "./types";

export function withDefaults(config: SchoolYearCardConfig): SchoolYearCardConfig {
  return {
    locale: "auto",
    past_breaks: "dim",
    show_header: true,
    show_status: true,
    show_next_break: true,
    show_countdown: true,
    show_weekday_for_single_day: true,
    compact: false,
    ...config,
  };
}
