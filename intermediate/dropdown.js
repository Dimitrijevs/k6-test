import { check, sleep } from "k6";
import { browser } from "k6/browser";

const BASE_URL =
  "https://www.lambdatest.com/selenium-playground/select-dropdown-demo";

export const options = {
  scenarios: {
    select_predefined_option: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
      exec: "testPredefinedSelection",
      options: {
        browser: {
          type: "chromium",
          headless: false,
        },
      },
    },

    select_random_option: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 1,
      exec: "testOptionSelection",
      options: {
        browser: {
          type: "chromium",
          headless: false,
        },
      },
    },
  },
};

// 1. select 1 option
export async function testPredefinedSelection() {
  const DROPDOWN_ITEM = "Monday";

  const page = await browser.newPage();

  await page.goto(BASE_URL);

  await page.waitForSelector("#select-demo", { timeout: 5000 });

  const dropdown = page.locator("#select-demo");

  // select element and give to it value
  await dropdown.selectOption(DROPDOWN_ITEM);

  // select result div
  await page.waitForSelector("p.selected-value", { timeout: 5000 });
  const selectedElement = page.locator("p.selected-value");
  const fullText = await selectedElement.textContent();

  check(fullText, {
    "Correct predefined item selected": (text) =>
      "Day selected :- " + DROPDOWN_ITEM === text,
  });
}

// 2. get all options from drodown and then select 1 random option
export async function testOptionSelection() {
  const page = await browser.newPage();

  await page.goto(BASE_URL);

  await page.waitForSelector("#select-demo", { timeout: 5000 });

  const options = await page.$$("#select-demo>option");

  // console.log(options);

  let optionValues = [];
  for (const option of options) {
    const value = await option.textContent();

    if (value !== "Please select") {
      optionValues.push(value);
    }
  }

  // console.log(optionValues);

  if (optionValues.length > 0) {
    const randomIndex = Math.floor(Math.random() * optionValues.length);
    const randomOption = optionValues[randomIndex];

    // console.log("Selecting random option: " + randomOption);

    const dropdown = page.locator("#select-demo");

    await dropdown.selectOption(randomOption);

    await page.waitForSelector("p.selected-value", { timeout: 5000 });
    const selectedElement = page.locator("p.selected-value");
    const fullText = await selectedElement.textContent();

    check(fullText, {
      "Correct random item selected": (text) =>
        "Day selected :- " + randomOption === text,
    });

    // sleep(2);
  }
}
