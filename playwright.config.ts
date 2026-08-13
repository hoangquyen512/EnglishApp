import { defineConfig, devices } from "@playwright/test";

const port = 8765;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "tests/ui",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
    channel: process.env.CI ? undefined : "chrome",
  },
  webServer: {
    command: `python3 -m http.server ${port} --directory .`,
    url: `${baseURL}/docs/uiux-demo/app.html`,
    reuseExistingServer: !process.env.CI,
  },
});
