import { expect, test } from "@playwright/test";

test("renders the login experience", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("SchoolFlow Admin Lite");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Continue with Google/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Apple$/i })).toHaveCount(0);
});

test("serves public tenant forms on direct routes", async ({ page }) => {
  await page.goto("/enroll?tenantId=tenant-test");
  await expect(page.getByRole("heading", { name: "Enroll Your Child" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Submit Registration/i })).toBeVisible();

  await page.goto("/parent-form?tenantId=tenant-test");
  await expect(page.getByRole("heading", { name: "Learner Registration Form" })).toBeVisible();
});

test("protects nested school and super-admin workspace routes", async ({ page }) => {
  await page.goto("/super-admin/clients");
  await expect(page).toHaveURL(/\/login\?next=%2Fsuper-admin%2Fclients$/);

  await page.goto("/school/learners");
  await expect(page).toHaveURL(/\/login\?next=%2Fschool%2Flearners$/);
});
