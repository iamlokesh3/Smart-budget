import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('budgetPlanner_duration');

export function budgetPlanner() {
  const url = `${BASE_URL}/api/budgets`;
  sendGet(url, SEEDED_USER.userId, 'budgetPlanner', (body) => Array.isArray(body), durationTrend);
}
