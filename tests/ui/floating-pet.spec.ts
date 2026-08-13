import { expect, test } from "@playwright/test";

test("live pet floats with a transparent plate", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=desktop");
  const floater = page.locator("#floater");
  await expect(floater).toBeVisible();
  await expect(floater.locator("img")).toBeVisible();
  await expect(floater).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(floater).not.toHaveClass(/habitat/);
});

test("clicking the pet opens the study popup", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=desktop");
  await page.locator("#floater").click();
  await expect(page.locator(".popup-ui")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Học ngay" })).toBeVisible();
});
