/**
 * Reusable HTTP Request Helpers with assertions for K6
 */
import http from 'k6/http';
import { check } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track success rate specifically
export const successRate = new Rate('success_rate');

export function getHeaders(userId) {
  return {
    'Content-Type': 'application/json',
    'x-user-id': userId || '1781096350731',
  };
}

export function sendGet(url, userId, checkName, validateBodyFn, durationTrend) {
  const params = { headers: getHeaders(userId) };
  const res = http.get(url, params);
  
  if (durationTrend) {
    durationTrend.add(res.timings.duration);
  }

  const ok = check(res, {
    [`${checkName} status is 200`]: (r) => r.status === 200,
    [`${checkName} authentication is processed`]: (r) => r.status !== 401 && r.status !== 403,
    [`${checkName} body contains valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    [`${checkName} business validation`]: (r) => {
      if (!validateBodyFn) return true;
      try {
        const bodyObj = JSON.parse(r.body);
        return validateBodyFn(bodyObj);
      } catch (e) {
        return false;
      }
    }
  });

  successRate.add(ok);
  return res;
}

export function sendPost(url, payload, userId, checkName, validateBodyFn, durationTrend) {
  const params = { headers: getHeaders(userId) };
  const res = http.post(url, JSON.stringify(payload), params);

  if (durationTrend) {
    durationTrend.add(res.timings.duration);
  }

  const ok = check(res, {
    [`${checkName} status is 200/201`]: (r) => r.status === 200 || r.status === 201,
    [`${checkName} authentication is processed`]: (r) => r.status !== 401 && r.status !== 403,
    [`${checkName} body contains valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    [`${checkName} business validation`]: (r) => {
      if (!validateBodyFn) return true;
      try {
        const bodyObj = JSON.parse(r.body);
        return validateBodyFn(bodyObj);
      } catch (e) {
        return false;
      }
    }
  });

  successRate.add(ok);
  return res;
}

export function sendPut(url, payload, userId, checkName, validateBodyFn, durationTrend) {
  const params = { headers: getHeaders(userId) };
  const res = http.put(url, JSON.stringify(payload), params);

  if (durationTrend) {
    durationTrend.add(res.timings.duration);
  }

  const ok = check(res, {
    [`${checkName} status is 200`]: (r) => r.status === 200,
    [`${checkName} authentication is processed`]: (r) => r.status !== 401 && r.status !== 403,
    [`${checkName} body contains valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    [`${checkName} business validation`]: (r) => {
      if (!validateBodyFn) return true;
      try {
        const bodyObj = JSON.parse(r.body);
        return validateBodyFn(bodyObj);
      } catch (e) {
        return false;
      }
    }
  });

  successRate.add(ok);
  return res;
}

export function sendDelete(url, userId, checkName, validateBodyFn, durationTrend) {
  const params = { headers: getHeaders(userId) };
  const res = http.del(url, null, params);

  if (durationTrend) {
    durationTrend.add(res.timings.duration);
  }

  const ok = check(res, {
    [`${checkName} status is 200`]: (r) => r.status === 200,
    [`${checkName} authentication is processed`]: (r) => r.status !== 401 && r.status !== 403,
    [`${checkName} body contains valid JSON`]: (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch (e) {
        return false;
      }
    },
    [`${checkName} business validation`]: (r) => {
      if (!validateBodyFn) return true;
      try {
        const bodyObj = JSON.parse(r.body);
        return validateBodyFn(bodyObj);
      } catch (e) {
        return false;
      }
    }
  });

  successRate.add(ok);
  return res;
}
