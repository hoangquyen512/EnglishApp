import { expect, test } from "@playwright/test";

test("onboarding offers three species then lands on home", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=onboard");
  await expect(page.getByRole("heading", { name: "Chọn người bạn đồng hành" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Chọn pet này" })).toHaveCount(3);
  await page.getByRole("button", { name: "Chọn pet này" }).first().click();
  await expect(page.getByText("Chế độ học")).toBeVisible();
});
