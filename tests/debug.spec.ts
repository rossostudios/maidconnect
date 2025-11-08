import { test } from "@playwright/test";

test("log help article error", async ({ page }) => {
  page.on("console", (msg) => {
    console.log("[browser]", msg.type(), msg.text());
  });

  await page.goto("http://localhost:3002/en/help/getting-started/your-first-booking-guide", {
    waitUntil: "networkidle",
  });

  await page.waitForTimeout(5000);
});
