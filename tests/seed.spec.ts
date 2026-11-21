import { expect, test } from "@playwright/test";

test.describe("Playwright agent seed", () => {
  test("loads starter foundation route as agent test baseline", async ({
    page,
  }) => {
    const response = await page.goto("/");

    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", {
        level: 1,
        name: "Global Fellowship Website Foundation",
      })
    ).toBeVisible();
  });
});
