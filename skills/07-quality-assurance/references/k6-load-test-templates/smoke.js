import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Smoke Test
 *
 * Purpose: Verify that the system works under minimal load.
 * Use this as a sanity check before running heavier load tests.
 *
 * Config: 1 virtual user, 1 minute duration.
 * Thresholds: P95 < 500ms, error rate < 1%.
 *
 * Run: k6 run smoke.js
 */

// [CUSTOMIZE] Replace with your staging/test environment URL
const BASE_URL = __ENV.BASE_URL || 'https://staging.yourapp.com';

export const options = {
  vus: 1,
  duration: '1m',

  thresholds: {
    // P95 response time must be under 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be under 1%
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  // [CUSTOMIZE] Replace these endpoints with your app's critical paths

  // Health check
  const healthRes = http.get(`${BASE_URL}/api/health`);
  check(healthRes, {
    'health check returns 200': (r) => r.status === 200,
    'health check responds in < 200ms': (r) => r.timings.duration < 200,
  });

  // Homepage
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage returns 200': (r) => r.status === 200,
    'homepage responds in < 500ms': (r) => r.timings.duration < 500,
  });

  // API endpoint (example: list resources)
  // [CUSTOMIZE] Replace with your actual API endpoint
  const apiRes = http.get(`${BASE_URL}/api/v1/status`, {
    headers: {
      'Content-Type': 'application/json',
      // [CUSTOMIZE] Add auth header if needed
      // 'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  });
  check(apiRes, {
    'API returns 200': (r) => r.status === 200,
    'API responds in < 500ms': (r) => r.timings.duration < 500,
    'API returns valid JSON': (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  // Pause between iterations to simulate real user pacing
  sleep(1);
}
