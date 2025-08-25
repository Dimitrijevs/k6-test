import http from "k6/http";
import { check } from "k6";

export const options = {
  vus: 2,
  duration: "10s",
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_duration: ["p(90)<200"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function () {
  const res = http.get("https://quickpizza.grafana.com");

  check(res, {
    "is status 200": (r) => r.status == 200,
  });
}
