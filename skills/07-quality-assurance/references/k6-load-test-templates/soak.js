import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

/**
 * Soak Test
 *
 * Purpose: Find memory leaks, connection pool exhaustion, and gradual
 * degradation that only appears after sustained load over time.
 *
 * Config: 50 VUs for 30 minutes.
 * Thresholds: P95 < 500ms, P99 < 1500ms, error rate < 1%.
 *
 * What to watch for:
 * - Response times gradually increasing (memory leak)
 * - Error rate climbing after N minutes (connection pool exhaustion)
 * - Server CPU/memory climbing without returning to baseline
 *
 * Run: k6 run soak.js
 * Run with output: k6 run --out json=soak-results.json soak.js
 */

// [CUSTOMIZE] Replace with your staging/test environment URL
const BASE_URL = __ENV.BASE_URL || 'https://staging.yourapp.com';

// Custom metrics for soak-specific monitoring
const apiDuration = new Trend('api_request_duration');
const apiErrors = new Counter('api_errors');

export const options = {
  stages: [
    // Ramp up to target load over 2 minutes
    { duration: '2m', target: 50 },
    // Hold at 50 VUs for 30 minutes (the soak period)
    { duration: '30m', target: 50 },
    // Ramp down over 1 minute
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    // Strict thresholds — soak tests should maintain performance over time
    http_req_duration: ['p(95)<500', 'p(99)<1500'],
    http_req_failed: ['rate<0.01'],

    // Custom metric thresholds
    api_request_duration: ['p(95)<500', 'avg<200'],
  },
};

export default function () {
  // [CUSTOMIZE] Replace these endpoints with your app's real user flow

  // 1. Simulate page load (GET requests)
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage returns 200': (r) => r.status === 200,
  });

  // 2. API read operation
  // [CUSTOMIZE] Replace with your actual API endpoint
  const listRes = http.get(`${BASE_URL}/api/v1/resources`, {
    headers: {
      'Content-Type': 'application/json',
      // [CUSTOMIZE] Add auth header if needed
      // 'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  });

  const listCheck = check(listRes, {
    'list API returns 200': (r) => r.status === 200,
    'list API responds in < 500ms': (r) => r.timings.duration < 500,
  });

  apiDuration.add(listRes.timings.duration);
  if (!listCheck) {
    apiErrors.add(1);
  }

  // 3. API write operation (tests DB connection pool under sustained load)
  // [CUSTOMIZE] Replace with your actual POST endpoint and payload
  const createRes = http.post(
    `${BASE_URL}/api/v1/events`,
    JSON.stringify({
      type: 'soak_test_event',
      timestamp: new Date().toISOString(),
      iteration: __ITER,
      vu: __VU,
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        // [CUSTOMIZE] Add auth header if needed
        // 'Authorization': `Bearer ${__ENV.API_TOKEN}`,
      },
    },
  );

  const createCheck = check(createRes, {
    'create returns 2xx': (r) => r.status >= 200 && r.status < 300,
    'create responds in < 500ms': (r) => r.timings.duration < 500,
  });

  apiDuration.add(createRes.timings.duration);
  if (!createCheck) {
    apiErrors.add(1);
  }

  // 4. API detail read (tests query performance under sustained load)
  // [CUSTOMIZE] Replace with your actual detail endpoint
  const detailRes = http.get(`${BASE_URL}/api/v1/resources/1`, {
    headers: {
      'Content-Type': 'application/json',
      // [CUSTOMIZE] Add auth header if needed
      // 'Authorization': `Bearer ${__ENV.API_TOKEN}`,
    },
  });

  check(detailRes, {
    'detail returns 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  apiDuration.add(detailRes.timings.duration);

  // Simulate realistic user pacing (1-3 second think time)
  sleep(Math.random() * 2 + 1);
}
