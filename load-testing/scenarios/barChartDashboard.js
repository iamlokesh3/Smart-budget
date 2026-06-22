import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('barChartDashboard_duration');

export function barChartDashboard() {
  const url = `${BASE_URL}/api/transactions/charts/bar`;
  sendGet(url, SEEDED_USER.userId, 'barChartDashboard', (body) => body.labels !== undefined, durationTrend);
}
