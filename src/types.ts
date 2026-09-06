export interface HomeAssistant {
  states: Record<string, {
    state: string;
    attributes: Record<string, unknown>;
  }>;
  language?: string;
}

export interface SchoolEvent {
  uid: string;
  name: string;
  type: string;
  start: string;
  end: string;
  school_closed: boolean;
  term: string | null;
  inferred: boolean;
}

export interface SchoolYearCardConfig {
  type: string;
  entity: string;
  title?: string;
  locale?: "auto" | "en" | "sv";
  past_breaks?: "hide" | "dim" | "show";
  show_header?: boolean;
  show_status?: boolean;
  show_next_break?: boolean;
  show_countdown?: boolean;
  show_weekday_for_single_day?: boolean;
  compact?: boolean;
}

export interface DisplayEvent extends SchoolEvent {
  startDate: Date;
  endDate: Date;
  daysUntil: number;
  phase: "past" | "active" | "future";
}
