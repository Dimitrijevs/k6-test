import http from "k6/http";
import exec from "k6/execution";
import { browser } from "k6/browser";
import { sleep, check, fail } from "k6";

const BASE_URL = "https://quickpizza.grafana.com";

export const options = {
  scenarios: {
    ui: {
      executor: "per-vu-iterations",
      vus: 1,
      iterations: 2,
      options: {
        browser: {
          type: "chromium",
        },
      },
    },
  },
  thresholds: {
    iteration_duration: ["p(95)<5000"], // time in ms
  },
};

// before main func, runs only once
export function setup() {
  let res = http.get(BASE_URL);

  if (res.status !== 200) {
    exec.test.abort(
      `Got unexpected status code ${res.status} when trying to setup. Exiting.`
    );
  }
}

export default async function () {
  const page = await browser.newPage();

  try {
    await page.goto(BASE_URL);

    let checkData = await page.locator("h1").textContent();

    check(page, {
      header: checkData === "Looking to break out of your pizza routine?",
    });

    sleep(1);

    await page.locator('//button[. = "Pizza, Please!"]').click(); // xpath syntax
    await page.waitForTimeout(500);

    await page.screenshot({ path: `screenshot/${__ITER}.png` }); // predefined variables

    checkData = await page.locator("div#recommendations").textContent();

    check(page, {
      recommendation: checkData !== "",
    });
  } catch (error) {
    fail(`Browser iteration failed: ${error.message}`);
  } finally {
    await page.close();
  }

  sleep(1);
}
