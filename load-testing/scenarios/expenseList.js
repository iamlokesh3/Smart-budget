import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('expenseList_duration');

export function expenseList() {
  const url = `${BASE_URL}/api/transactions`;
  sendGet(url, SEEDED_USER.userId, 'expenseList', (body) => Array.isArray(body), durationTrend);
}
