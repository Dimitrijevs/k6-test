import http from "k6/http";
import { sleep, check } from "k6";

const BASE_URL = "http://localhost:3333";

// export const options = {
//   vus: 2,
//   duration: '30s'
// };

export let options = {
  stages: [
    { duration: "2s", target: 10 },
    { duration: "5s", target: 10 },
    { duration: "2s", target: 0 },
  ],
  //   thresholds: {
  //     "http_req_duration": ["p(95)<2000"], // 2 = 2ms, 2000 = 2sec
  //   },
  thresholds: {
    http_req_duration: [{ threshold: "p(95)<2000", abortOnFail: true }],
  },
};

export function setup() {

  let res = http.get(BASE_URL)

  if (res.status !== 200) {
    throw new Error(`Got unexpected status code ${res.status} when trying to setup. Exiting.`)
  }
}

export default function () {
  const res = http.get(BASE_URL);

  check(res, {
    "is status 200": (r) => r.status === 200,
  });

  sleep(1);
}

// default handle summary
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
  };
}