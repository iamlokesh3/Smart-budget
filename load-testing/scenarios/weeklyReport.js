import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('weeklyReport_duration');

export function weeklyReport() {
  const url = `${BASE_URL}/api/transactions`;
  sendGet(url, SEEDED_USER.userId, 'weeklyReport', (body) => Array.isArray(body), durationTrend);
}
