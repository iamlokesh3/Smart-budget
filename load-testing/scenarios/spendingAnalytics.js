import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('spendingAnalytics_duration');

export function spendingAnalytics() {
  const url = `${BASE_URL}/api/transactions/analytics`;
  sendGet(url, SEEDED_USER.userId, 'spendingAnalytics', (body) => body.monthlySpending !== undefined, durationTrend);
}
