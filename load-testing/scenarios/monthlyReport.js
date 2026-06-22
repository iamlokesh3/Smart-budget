import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('monthlyReport_duration');

export function monthlyReport() {
  const url = `${BASE_URL}/api/transactions`;
  sendGet(url, SEEDED_USER.userId, 'monthlyReport', (body) => Array.isArray(body), durationTrend);
}
