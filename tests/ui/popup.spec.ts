import { expect, test } from "@playwright/test";

test("flashcard has English specimen and four Vietnamese choices", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=popup");
  const prompt = page.locator(".prompt");
  await expect(prompt).toHaveAttribute("lang", "en");
  await expect(prompt).toHaveText("time");
  await expect(page.locator(".choice")).toHaveCount(4);
  await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
  await expect(page.getByLabel("Đóng cửa sổ học")).toBeVisible();
});

test("correct answer shows XP and next card", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=popup");
  await page.locator(".choice").first().click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText("Đúng rồi!")).toBeVisible();
  await expect(page.getByText(/Pet vui lên/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Thẻ tiếp theo" })).toBeVisible();
});

test("keys 1–4 and Enter complete a card", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=popup");
  await page.locator(".popup-ui").click();
  await page.keyboard.press("1");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Đúng rồi!")).toBeVisible();
});
