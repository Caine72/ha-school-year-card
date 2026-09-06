import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { EDITOR_TAG } from "./const";
import { withDefaults } from "./config";
import type { HomeAssistant, SchoolYearCardConfig } from "./types";

type ValueChangedEvent = CustomEvent<{ value: SchoolYearCardConfig }>;

@customElement(EDITOR_TAG)
export class SchoolYearCardEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private config?: SchoolYearCardConfig;

  setConfig(config: SchoolYearCardConfig): void { this.config = withDefaults(config); }

  protected render() {
    if (!this.config) return nothing;
    return html`<ha-form
      .hass=${this.hass}
      .data=${this.config}
      .schema=${this.schema}
      .computeLabel=${this.computeLabel}
      @value-changed=${this.valueChanged}
    ></ha-form>`;
  }

  private readonly schema = [
    { name: "entity", required: true, selector: { entity: { filter: [{ domain: "sensor", integration: "school_year" }] } } },
    { name: "title", selector: { text: {} } },
    { name: "locale", selector: { select: { mode: "dropdown", options: [
      { label: "Automatic", value: "auto" }, { label: "English", value: "en" }, { label: "Svenska", value: "sv" },
    ] } } },
    { name: "past_breaks", selector: { select: { mode: "dropdown", options: [
      { label: "Hide", value: "hide" }, { label: "Dim", value: "dim" }, { label: "Show", value: "show" },
    ] } } },
    { type: "grid", name: "display", flatten: true, schema: [
      { name: "show_header", selector: { boolean: {} } },
      { name: "show_status", selector: { boolean: {} } },
      { name: "show_next_break", selector: { boolean: {} } },
      { name: "show_countdown", selector: { boolean: {} } },
      { name: "show_weekday_for_single_day", selector: { boolean: {} } },
      { name: "compact", selector: { boolean: {} } },
    ] },
  ];

  private computeLabel = (schema: { name?: string }): string => ({
    entity: "School Year status entity", title: "Title", locale: "Language", past_breaks: "Past breaks",
    display: "Display", show_header: "Show header", show_status: "Show today's status",
    show_next_break: "Highlight next break", show_countdown: "Show countdown",
    show_weekday_for_single_day: "Show weekday for single-day breaks",
    compact: "Compact spacing",
  })[schema.name ?? ""] ?? schema.name ?? "";

  private valueChanged(event: ValueChangedEvent): void {
    event.stopPropagation();
    this.config = event.detail.value;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: this.config }, bubbles: true, composed: true }));
  }
}
