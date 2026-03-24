import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Spike Test
 *
 * Purpose: Test how the system handles a sudden burst of traffic.
 * Simulates a scenario like a product launch, marketing campaign,
 * or getting featured on a popular site.
 *
 * Config: Ramp from 1 to 100 VUs in 10s, hold 30s, ramp down in 10s.
 * Thresholds: P95 < 1000ms during spike, error rate < 5%.
 *
 * Run: k6 run spike.js
 */

// [CUSTOMIZE] Replace with your staging/test environment URL
const BASE_URL = __ENV.BASE_URL || 'https://staging.yourapp.com';

export const options = {
  stages: [
    // Warm up with minimal load
    { duration: '10s', target: 1 },
    // Spike: ramp to 100 users in 10 seconds
    { duration: '10s', target: 100 },
    // Hold at peak for 30 seconds
    { duration: '30s', target: 100 },
    // Ramp down to 0
    { duration: '10s', target: 0 },
  ],

  thresholds: {
    // During a spike, allow slightly higher response times
    http_req_duration: ['p(95)<1000', 'p(99)<2000'],
    // Allow up to 5% error rate during spike (adjust based on your SLA)
    http_req_failed: ['rate<0.05'],
  },
};

export default function () {
  // [CUSTOMIZE] Replace these endpoints with your app's critical paths

  // Simulate a typical user flow during high traffic

  // 1. Homepage load
  const homeRes = http.get(`${BASE_URL}/`);
  check(homeRes, {
    'homepage returns 200': (r) => r.status === 200,
  });

  // 2. API call (e.g., loading dashboard data)
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
    'API responds in < 1000ms': (r) => r.timings.duration < 1000,
  });

  // 3. Simulate a write operation (e.g., creating a resource)
  // [CUSTOMIZE] Replace with your actual POST endpoint and payload
  const createRes = http.post(
    `${BASE_URL}/api/v1/events`,
    JSON.stringify({
      type: 'page_view',
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        // [CUSTOMIZE] Add auth header if needed
        // 'Authorization': `Bearer ${__ENV.API_TOKEN}`,
      },
    },
  );
  check(createRes, {
    'POST returns 2xx': (r) => r.status >= 200 && r.status < 300,
  });

  // Brief pause between requests (simulates user think time)
  sleep(0.5);
}
