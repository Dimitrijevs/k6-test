import http from 'k6/http';
import { check } from "k6";

export const options = {
    vus: 2,
    duration: "10s",
};

export default function () {
  
  const res = http.get('https://quickpizza.grafana.com');

  check(res, {
    "is status 200": (r) => r.status == 200,
  });
}