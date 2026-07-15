import { expect, test } from "@playwright/test";

test("renders the login experience", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("SchoolFlow Admin Lite");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
});

test("serves public tenant forms on direct routes", async ({ page }) => {
  await page.goto("/enroll?tenantId=tenant-test");
  await expect(page.getByRole("heading", { name: "Enroll Your Child" })).toBeVisible();

  await page.goto("/parent-form?tenantId=tenant-test");
  await expect(page.getByRole("heading", { name: "Learner Registration Form" })).toBeVisible();
});

test("protects a direct nested workspace route", async ({ page }) => {
  await page.goto("/super-admin/clients");
  await expect(page).toHaveURL(/\/login\?next=%2Fsuper-admin%2Fclients$/);
});
