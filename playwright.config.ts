import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  use: { baseURL: "http://127.0.0.1:3000" },
  webServer: {
    command: "npx next dev -p 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      AUTH_SECRET: "test-secret-test-secret-test-secret-12",
      AUTH_URL: "http://127.0.0.1:3000",
      LLM_FAKE: "1",
      SQLITE_PATH: "data/e2e.sqlite",
    },
  },
});
