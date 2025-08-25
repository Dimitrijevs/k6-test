import { check, sleep } from "k6";
import { browser, networkProfiles } from "k6/browser";

const BASE_URL = "https://quickpizza.grafana.com";

export const options = {
  scenarios: {
    throttle_test: {
      executor: "per-vu-iterations",
      vus: 2,
      iterations: 3,
      options: {
        browser: {
          type: "chromium",
          headless: false,
        },
      },
    },
  },
};

export default async function () {
  const page = await browser.newPage();
  page.throttleNetwork(networkProfiles['Slow 3G']);

  await page.goto(BASE_URL);

  page.close();
}
