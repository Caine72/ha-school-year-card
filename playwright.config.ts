import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests/ha-frontend",
  timeout: 60_000,
  use: {
    baseURL: process.env.HA_URL ?? "http://127.0.0.1:8123",
    browserName: "chromium",
    bypassCSP: true,
    headless: true,
  },
});
