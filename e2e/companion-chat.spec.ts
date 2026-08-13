import { expect, test } from "@playwright/test";

test("register, chat with Sora, open coach chip, keep history", async ({ page }) => {
  const email = `sora-${Date.now()}@example.com`;

  await page.goto("/login");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await page.getByLabel("Tên hiển thị").fill("Quyen");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill("password1");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();

  await expect(page.getByRole("heading", { name: "Sora" })).toBeVisible();
  await expect(page.locator(".bubble").first()).toContainText(/Hey|day/i);

  await page.getByPlaceholder("Nói với Sora bằng tiếng Anh").fill(
    "I sleep a little better last night",
  );
  await page.getByRole("button", { name: "Gửi" }).click();
  await expect(page.locator(".row.sora .bubble").last()).toBeVisible();

  const chip = page.getByRole("button", { name: /Cách nói tự nhiên hơn|Gợi ý tiếng Anh/ });
  await expect(chip).toBeVisible();
  await chip.click();
  await expect(page.getByText(/slept/i)).toBeVisible();
  await page.getByRole("button", { name: "Dùng câu này" }).click();
  await expect(page.getByPlaceholder("Nói với Sora bằng tiếng Anh")).toHaveValue(
    /I slept a little better/i,
  );

  await page.getByRole("link", { name: "Hồ sơ" }).click();
  await expect(page.getByRole("heading", { name: "Quyen" })).toBeVisible();
  await page.getByRole("button", { name: "Đăng xuất" }).click();

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Mật khẩu").fill("password1");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByText("I sleep a little better last night")).toBeVisible();
});
