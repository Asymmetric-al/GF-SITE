import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PLAYWRIGHT_PORT ?? "3147");
const EXTERNAL_BASE_URL = process.env.E2E_BASE_URL;
const BASE_URL = EXTERNAL_BASE_URL ?? `http://127.0.0.1:${PORT}`;

const START_COMMAND =
  process.env.E2E_START_COMMAND ??
  `bun run start -- --hostname 127.0.0.1 --port ${PORT}`;

const USE_LOCAL_WEB_SERVER =
  EXTERNAL_BASE_URL === undefined ||
  process.env.E2E_START_COMMAND !== undefined;

const IS_CI = Boolean(process.env.CI);

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  forbidOnly: IS_CI,
  fullyParallel: true,
  globalTimeout: IS_CI ? 15 * 60_000 : undefined,
  outputDir: "test-results/playwright",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile-webkit",
      use: { ...devices["iPhone 13"] },
    },
  ],
  reporter: IS_CI
    ? [
        ["github"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ]
    : [
        ["list"],
        ["html", { open: "never", outputFolder: "playwright-report" }],
      ],
  retries: 0,
  testDir: "./tests",
  timeout: 45_000,
  use: {
    baseURL: BASE_URL,
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  ...(USE_LOCAL_WEB_SERVER
    ? {
        webServer: {
          command: START_COMMAND,
          env: {
            CHECKOUT_BASE_URL: "",
            DONOR_APP_BASE_URL: "",
            NEXT_PUBLIC_DONOR_APP_BASE_URL: "",
          },
          reuseExistingServer: false,
          timeout: 120_000,
          url: BASE_URL,
        },
      }
    : undefined),
  workers: IS_CI ? 1 : 4,
});
