import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('goals_duration');

export function goals() {
  const url = `${BASE_URL}/api/goals`;
  sendGet(url, SEEDED_USER.userId, 'goals', (body) => Array.isArray(body), durationTrend);
}
