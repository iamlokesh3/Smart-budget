import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('categoryAnalysis_duration');

export function categoryAnalysis() {
  const url = `${BASE_URL}/api/transactions/analytics`;
  sendGet(url, SEEDED_USER.userId, 'categoryAnalysis', (body) => body.topCategories !== undefined, durationTrend);
}
