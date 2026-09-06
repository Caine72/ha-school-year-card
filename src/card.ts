import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

import { CARD_TAG, DEFAULT_APPEARANCE, EDITOR_TAG, EVENT_APPEARANCE } from "./const";
import { withDefaults } from "./config";
import { normalizeEvents, schoolYearLabel } from "./data";
import { language, localize } from "./localize";
import type { DisplayEvent, HomeAssistant, SchoolYearCardConfig } from "./types";

@customElement(CARD_TAG)
export class SchoolYearCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  private config?: SchoolYearCardConfig;

  static async getConfigElement(): Promise<HTMLElement> {
    await customElements.whenDefined(EDITOR_TAG);
    return document.createElement(EDITOR_TAG);
  }

  static getStubConfig(hass: HomeAssistant): Omit<SchoolYearCardConfig, "type"> {
    const entity = Object.keys(hass.states).find((id) => id.startsWith("sensor.") && Array.isArray(hass.states[id].attributes.events)) ?? "";
    return { entity };
  }

  setConfig(config: SchoolYearCardConfig): void {
    if (!config.entity) throw new Error("School Year status entity is required");
    this.config = withDefaults(config);
  }

  getCardSize(): number { return this.config?.compact ? 5 : 7; }
  getGridOptions() { return { columns: 12, min_columns: 6, min_rows: 3 }; }

  protected render() {
    if (!this.hass || !this.config) return nothing;
    const state = this.hass.states[this.config.entity];
    const locale = language(this.config.locale, this.hass.language);
    if (!state) return html`<ha-card><div class="empty">${localize(locale, "unavailable")}</div></ha-card>`;
    let events = normalizeEvents(state.attributes.events);
    if (this.config.past_breaks === "hide") events = events.filter((event) => event.phase !== "past");
    const next = events.find((event) => event.phase === "active") ?? events.find((event) => event.phase === "future");
    return html`<ha-card
      class=${this.config.compact ? "compact" : ""}
    >
      ${this.config.show_header ? this.renderHeader(state.state, events, locale) : nothing}
      ${this.config.show_next_break && next ? this.renderNext(next, locale) : nothing}
      <section class="timeline" aria-label=${localize(locale, "breaks")}>
        <h2>${localize(locale, "breaks")}</h2>
        ${events.length ? events.map((event) => this.renderEvent(event, locale)) : html`<div class="empty">${localize(locale, "noBreaks")}</div>`}
      </section>
    </ha-card>`;
  }

  private renderHeader(status: string, events: DisplayEvent[], locale: "en" | "sv") {
    const raw = this.hass?.states[this.config!.entity].attributes.raw_status;
    const statusKey = ({ school_day: "schoolDay", school_closed: "schoolClosed", weekend: "weekend", outside_term: "outsideTerm" } as const)[String(raw)] ?? "unknown";
    return html`<header>
      <div class="hero-icon"><ha-icon icon="mdi:calendar-check-outline"></ha-icon></div>
      <div class="heading"><h1>${this.config!.title || localize(locale, "title")}</h1><div>${schoolYearLabel(events)}</div></div>
      ${this.config!.show_status ? html`<div class="chips"><span><ha-icon icon="mdi:school-outline"></ha-icon>${localize(locale, statusKey)}</span><span><ha-icon icon="mdi:calendar-range"></ha-icon>${events.length}</span></div>` : nothing}
    </header>`;
  }

  private renderNext(event: DisplayEvent, locale: "en" | "sv") {
    const appearance = EVENT_APPEARANCE[event.type] ?? DEFAULT_APPEARANCE;
    return html`<section class="next" style=${`--event-color:${appearance.color}`}>
      <div class="event-icon"><ha-icon icon=${appearance.icon}></ha-icon></div>
      <div><small>${localize(locale, "nextBreak")}</small><h2>${event.name}</h2><div class="date">${this.dateRange(event, locale)}</div></div>
      ${this.config!.show_countdown ? html`<div class="countdown"><strong>${event.phase === "active" ? localize(locale, "active") : event.daysUntil}</strong>${event.phase === "future" ? html`<span>${event.daysUntil === 1 ? localize(locale, "day") : localize(locale, "days")}</span>` : nothing}</div>` : nothing}
    </section>`;
  }

  private renderEvent(event: DisplayEvent, locale: "en" | "sv") {
    const appearance = EVENT_APPEARANCE[event.type] ?? DEFAULT_APPEARANCE;
    return html`<article class="event ${event.phase}" style=${`--event-color:${appearance.color}`}>
      <span class="node"></span><div class="event-icon"><ha-icon icon=${appearance.icon}></ha-icon></div>
      <div class="event-copy"><h3>${event.name}</h3><div class="date">${this.dateRange(event, locale)}</div></div>
      <div class="metric">${event.phase === "active" ? html`<strong>${localize(locale, "active")}</strong>` : this.config!.show_countdown && event.phase === "future" ? html`<strong>${event.daysUntil}</strong><span>${event.daysUntil === 1 ? localize(locale, "day") : localize(locale, "days")}</span>` : nothing}</div>
    </article>`;
  }

  private dateRange(event: DisplayEvent, locale: string): string {
    if (event.start === event.end) {
      return new Intl.DateTimeFormat(locale, {
        weekday: this.config!.show_weekday_for_single_day ? "short" : undefined,
        day: "numeric",
        month: "short",
      }).format(event.startDate);
    }
    const formatter = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
    return `${formatter.format(event.startDate)} – ${formatter.format(event.endDate)}`;
  }

  static styles = css`
    :host { display:block; --card-primary-color:var(--primary-text-color); --card-secondary-color:var(--secondary-text-color); }
    ha-card { box-sizing:border-box; padding:24px; overflow:hidden; color:var(--card-primary-color); cursor:default; }
    header { display:grid; grid-template-columns:auto 1fr; gap:14px; align-items:center; }
    .hero-icon,.event-icon { display:grid; place-items:center; border-radius:50%; }
    .hero-icon { width:52px; height:52px; color:var(--primary-color); background:color-mix(in srgb,var(--primary-color) 20%,transparent); }
    .hero-icon ha-icon { --mdc-icon-size:28px; }
    h1,h2,h3 { margin:0; } h1 { font-size:24px; line-height:1.15; } .heading>div,.date,small { color:var(--card-secondary-color); }
    .chips { grid-column:1/-1; display:flex; gap:8px; flex-wrap:wrap; }
    .chips span { display:flex; align-items:center; gap:6px; padding:7px 10px; border:1px solid var(--divider-color); border-radius:999px; font-size:13px; }
    .chips ha-icon { --mdc-icon-size:18px; color:var(--primary-color); }
    .next { position:relative; display:grid; grid-template-columns:auto minmax(0,1fr) auto; align-items:center; gap:16px; margin-top:20px; padding:18px 22px 18px 18px; border:1px solid var(--divider-color); border-radius:18px; overflow:hidden; }
    .next::after,.event::after { content:""; position:absolute; inset-block:10px; inset-inline-end:0; width:4px; border-radius:4px 0 0 4px; background:var(--event-color); }
    .event-icon { width:48px; height:48px; color:var(--event-color); background:color-mix(in srgb,var(--event-color) 20%,transparent); }
    .next h2 { font-size:20px; margin:3px 0; } .countdown,.metric { text-align:right; display:flex; flex-direction:column; }
    .countdown strong { color:var(--event-color); font-size:28px; font-weight:500; } .countdown span,.metric span { color:var(--card-secondary-color); font-size:13px; }
    .timeline { margin-top:24px; position:relative; } .timeline>h2 { font-size:16px; margin:0 0 14px 2px; color:var(--card-secondary-color); }
    .timeline::before { content:""; position:absolute; top:44px; bottom:32px; left:15px; width:1px; background:var(--divider-color); }
    .event { box-sizing:border-box; position:relative; display:grid; grid-template-columns:auto minmax(0,1fr) auto; gap:14px; align-items:center; width:calc(100% - 34px); min-height:72px; margin:10px 0 10px 34px; padding:12px 18px 12px 14px; border:1px solid var(--divider-color); border-radius:16px; }
    .event .node { position:absolute; left:-27px; width:12px; height:12px; border:2px solid var(--event-color); border-radius:50%; background:var(--ha-card-background,var(--card-background-color)); }
    .event .event-icon { width:42px; height:42px; } .event-copy h3 { font-size:15px; } .event-copy small { display:block; margin-top:3px; font-size:11px; }
    .metric strong { color:var(--event-color); font-size:19px; font-weight:500; } .metric small { margin-top:3px; }
    .event.past { opacity:.48; } .empty { padding:24px; text-align:center; color:var(--card-secondary-color); }
    .compact { padding:18px; } .compact .next { margin-top:14px; padding:14px 18px 14px 14px; } .compact .timeline { margin-top:18px; } .compact .event { min-height:60px; margin-top:7px; margin-bottom:7px; padding-block:9px; }
    @media (max-width:420px) { ha-card { padding:20px; } .next { gap:14px; padding:16px 20px 16px 16px; } .event { width:calc(100% - 30px); margin-left:30px; gap:12px; padding:12px 16px 12px 12px; } .timeline::before { left:13px; } .event .node { left:-24px; } }
    @media (prefers-reduced-motion:reduce) { * { scroll-behavior:auto!important; } }
  `;
}
