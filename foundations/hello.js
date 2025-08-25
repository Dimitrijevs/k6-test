import http from 'k6/http';

export const options = {
  iterations: 1,
};

export default function () {
  
  http.get('https://quickpizza.grafana.com');
}