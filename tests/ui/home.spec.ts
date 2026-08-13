import { expect, test } from "@playwright/test";

test("home is a control panel with one primary study action", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=home");
  await expect(page.getByText("Chế độ học")).toBeVisible();
  await expect(page.locator(".home").getByRole("button", { name: "Học ngay" })).toBeVisible();
  await expect(page.getByText("Nhiệm vụ hôm nay")).toBeVisible();
  await expect(page.getByLabel("Nhắc học mỗi (phút)")).toBeVisible();
  const primary = page.locator(".home .btn-primary");
  await expect(primary).toHaveCount(1);
  await expect(primary).toHaveCSS("background-color", "rgb(194, 65, 12)");
});

test("tray labels stay Vietnamese", async ({ page }) => {
  await page.goto("/docs/uiux-demo/app.html?screen=desktop");
  const tray = page.getByRole("navigation", { name: "Khay hệ thống" });
  await expect(tray.getByRole("button", { name: "Mở app" })).toBeVisible();
  await expect(tray.getByRole("button", { name: "Học ngay" })).toBeVisible();
  await expect(tray.getByRole("button", { name: "Thoát" })).toBeVisible();
});
