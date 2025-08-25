import http from "k6/http";
import { check, sleep } from "k6";
import { browser } from "k6/browser";

const BASE_URL =
  "https://www.lambdatest.com/selenium-playground/upload-file-demo";

export const options = {
  scenarios: {
    throttle_test: {
      executor: "per-vu-iterations",
      vus: 1,
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

  await page.goto(BASE_URL);

  await page.waitForSelector('#file', { timeout: 5000 });

  await page.setInputFiles("#file", { name: "../other/test_doc.pdf"});

  const uploadedFile = await page.locator("input#file").inputValue();

  check(uploadedFile, {
    "File upload successful": (file) => file.length > 0,
  });

  page.close();
}
