import http from "k6/http";
import exec from "k6/execution";
import { browser } from "k6/browser";
import { sleep, check, fail } from "k6";

const BASE_URL = "https://quickpizza.grafana.com";

const USER_NAME = "default";
const USER_PASSWORD = "12345678";

export const options = {
  scenarios: {
    login: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
      options: {
        browser: {
          type: "chromium",
          headless: false,
        },
      },
    },
  },
};

// before main func, runs only once
export function setup() {
  let res = http.get(BASE_URL);

  if (res.status !== 200) {
    exec.test.abort(
      `Got unexpected status code ${res.status} when trying to setup.`
    );
  }
}

export default async function () {
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL);

    // Wait for page to load
    await page.waitForSelector("h1", { timeout: 10000 });

    // Get and check the main page header
    const mainHeaderText = await page.locator("h1").textContent();

    check(mainHeaderText, {
      "Correct header text": (text) =>
        text.trim() === "Looking to break out of your pizza routine?",
    });

    // Click login link and wait for navigation
    const loginLink = page.locator("a[href='/login']");
    await loginLink.waitFor({ timeout: 5000 });

    await Promise.all([
      page.waitForNavigation({ timeout: 5000 }), // wait untill gets navigates to a new url
      loginLink.click(),
    ]);

    // Wait for login page to load
    await page.waitForSelector("h1", { timeout: 5000 }); // wait untill h1 shows up

    // Get login page heading
    const loginHeaderText = await page.locator("h1").textContent();

    check(loginHeaderText, {
      "Login page header": (text) => text.trim() === "QuickPizza User Login",
    });

    const usernameField = page.locator("#username");
    await usernameField.waitFor({ timeout: 5000 });
    await usernameField.click(); // Click to focus
    // await usernameField.clear(); // Clear any existing content, not necessary
    sleep(0.2); // Small pause to simulate user behaviour
    await usernameField.type(USER_NAME, { delay: 50 });

    // Verify what was typed
    const typedUsername = await usernameField.inputValue();
    check(typedUsername, {
      "Correct username": (username) => username.trim() === USER_NAME,
    });

    sleep(0.5);

    // Fill password with same approach
    const passwordField = page.locator("#password");
    await passwordField.click(); // Click to focus
    // await passwordField.clear(); // Clear any existing content, not necessary
    sleep(0.2); // Small pause
    await passwordField.type(USER_PASSWORD, { delay: 50 }); // Increased delay

    // Verify what was typed (don't log password for security)
    const typedPassword = await passwordField.inputValue();
    check(typedPassword, {
      "Correct password": (password) => password.trim() === USER_PASSWORD,
    });

    sleep(1);

    // Submit form
    const submitButton = page.locator("button[type='submit']");
    await submitButton.waitFor({ timeout: 5000 });

    // Click submit and wait for navigation
    // basically starts watching for h2 tag, max 5 sec
    // at the same time it submits form
    await Promise.all([
      page.waitForSelector("h2", { timeout: 5000 }),
      submitButton.click(),
    ]);

    // Check dashboard title
    const dashboardTitleText = await page.locator("h2").textContent();

    check(dashboardTitleText, {
      "Correct dashboard title": (text) => text.trim().includes("Your Pizza Ratings"),
    });
  } catch (error) {
    console.error("Full error object:", error);

    // Take error screenshot
    await page.screenshot({
      fullPage: true,
      path: `screenshots/error-${Date.now()}.png`,
    });
 
    // sometimes error is an object, sometimes as a string
    fail(`Browser iteration failed: ${error?.message || String(error)}`);
  } finally {
    await page.close();
  }
}
