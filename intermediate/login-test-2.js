import { browser } from "k6/browser";
import { check, sleep } from "k6";

const BASE_URL =
  "https://naveenautomationlabs.com/opencart/index.php?route=account/register";

const DELAY = 50; // 50 ms
const WAIT_TIME = 0.5; // 0.5 seconds

export const options = {
  scenarios: {
    browser_test: {
      executor: "shared-iterations",
      options: {
        browser: {
          type: "chromium",
          headless: false,
        },
      },
    },
  },
};

async function fillForm(page, fields) {
  for (const field of fields) {
    await enterInputValue(page, field.selector, field.value);
  }
}

async function enterInputValue(page, selector, value) {
  await page.locator(selector).clear();
  await page.locator(selector).type(value, { delay: DELAY });

  if (WAIT_TIME > 0) {
    sleep(WAIT_TIME);
  }
}

export default async function () {
  const page = await browser.newPage();

  const uniqueEmail = `john.doe.k6test.${Date.now()}@gmail.com`;

  const FORM_FIELDS = [
    { selector: "#input-firstname", value: "John" },
    { selector: "#input-lastname", value: "Doe" },
    { selector: "#input-email", value: uniqueEmail },
    { selector: "#input-telephone", value: "1234567890" },
    { selector: "#input-password", value: "Test123!!" },
    { selector: "#input-confirm", value: "Test123!!" },
  ];

  try {
    // Navigate to registration page
    await page.goto(BASE_URL);

    // Wait for page to load completely
    await page.waitForSelector("#input-firstname", { timeout: 5000 });

    // Clear and fill first name
    // await enterInputValue(page, "#input-firstname", "John");

    // // Clear and fill last name
    // await enterInputValue(page, "#input-lastname", "Doe");

    // // Clear and fill email
    // await enterInputValue(page, "#input-email", uniqueEmail);

    // // Clear and fill telephone
    // await enterInputValue(page, "#input-telephone", "1234567890");

    // // Clear and fill password
    // await enterInputValue(page, "#input-password", "Test123!!");

    // // Clear and fill confirm password
    // await enterInputValue(page, "#input-confirm", "Test123!!");

    // updated method
    await fillForm(page, FORM_FIELDS);

    // Check privacy policy checkbox with more specific selector
    const checkbox = page.locator('input[name="agree"]');
    await checkbox.waitFor({ timeout: 5000 });
    if (!(await checkbox.isChecked())) {
      await checkbox.check();
    }

    // Wait a bit before submitting
    sleep(1);

    // Submit form with better handling
    const submitButton = page.locator('input[type="submit"][value="Continue"]');
    await submitButton.waitFor({ timeout: 5000 });

    // Click submit and wait for navigation
    await Promise.all([
      page.waitForNavigation({ timeout: 15000 }),
      submitButton.click(),
    ]);

    // Wait for the specific success element to load
    await page.waitForSelector("#content h1", { timeout: 5000 });

    // Get the success heading text using the specific selector
    const successElement = page.locator("#content h1");
    const successText = await successElement.textContent();

    // Validation check - get the text first, then use it in check
    const expectedText = "Your Account Has Been Created!";
    const actualText = successText.trim();

    check(actualText, {
      "Account created successfully": (text) => text === expectedText,
      "Success page loaded": (text) => text.length > 0,
    });
  } catch (error) {
    console.error("Test failed:", error);

    // Take error screenshot
    await page.screenshot({
      fullPage: true,
      path: "screenshots/error.png",
    });

    // Re-throw the error so the test properly fails
    throw error;
  } finally {
    await page.close();
  }
}
