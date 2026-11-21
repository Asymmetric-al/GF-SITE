import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? "3147");
const BASE_URL = `http://127.0.0.1:${PORT}`;
const IS_CI = Boolean(process.env.CI);

export default defineConfig({
  forbidOnly: IS_CI,
  fullyParallel: true,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  reporter: IS_CI ? "github" : "list",
  retries: IS_CI ? 1 : 0,
  testDir: "./tests",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  webServer: {
    command: `bun run start -- --hostname 127.0.0.1 --port ${PORT}`,
    reuseExistingServer: false,
    timeout: 60_000,
    url: BASE_URL,
  },
});
