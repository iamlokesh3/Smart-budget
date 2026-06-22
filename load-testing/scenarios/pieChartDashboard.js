import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('pieChartDashboard_duration');

export function pieChartDashboard() {
  const url = `${BASE_URL}/api/transactions/charts/pie`;
  sendGet(url, SEEDED_USER.userId, 'pieChartDashboard', (body) => body.labels !== undefined, durationTrend);
}
