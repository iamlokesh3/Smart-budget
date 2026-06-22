import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('logout_duration');

export function logout() {
  const url = `${BASE_URL}/api/auth/logout`;
  const payload = {};
  sendPost(url, payload, SEEDED_USER.userId, 'logout', (body) => body.success === true, durationTrend);
}
