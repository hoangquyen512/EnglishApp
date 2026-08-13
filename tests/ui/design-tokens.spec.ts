import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const tokens = JSON.parse(
  readFileSync(join(process.cwd(), "design-system", "tokens.json"), "utf8"),
);

test("primary fill is AA terracotta, not decorative orange", () => {
  expect(tokens.locks.primaryFill).toBe("#c2410c");
  expect(tokens.locks.primaryFillForbidden).toBe("#ea580c");
  expect(tokens.color["terracotta-700"]).toBe("#c2410c");
});

test("pet overlay lock stays on", () => {
  expect(tokens.locks.petFloatsOnDesktop).toBe(true);
  expect(tokens.locks.petHasBackgroundPlate).toBe(false);
});

test("demo CSS exposes the locked primary token", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=home");
  const primary = await page.evaluate(() =>
    getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim(),
  );
  expect(primary).toBe(tokens.locks.primaryFill);
});
