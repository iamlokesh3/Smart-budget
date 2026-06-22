import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('notifications_duration');

export function notifications() {
  const url = `${BASE_URL}/api/notifications`;
  sendGet(url, SEEDED_USER.userId, 'notifications', (body) => Array.isArray(body), durationTrend);
}
