import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('savingsGoals_duration');

export function savingsGoals() {
  const url = `${BASE_URL}/api/goals`;
  sendGet(url, SEEDED_USER.userId, 'savingsGoals', (body) => Array.isArray(body), durationTrend);
}
