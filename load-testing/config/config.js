/**
 * K6 Load Testing Central Configuration
 */
export const BASE_URL = __ENV.BASE_URL || 'http://localhost:5000';
export const TEST_DURATION = __ENV.TEST_DURATION || '1m';
export const VUS = parseInt(__ENV.VUS || '310', 10);

export const THRESHOLDS = {
  // Average response time must be under 500 ms
  // 95th percentile response time must be under 1000 ms
  http_req_duration: ['avg<500', 'p(95)<1000'],
  
  // Success rate >= 99% (Error rate < 1%)
  http_req_failed: ['rate<0.01'],
};
