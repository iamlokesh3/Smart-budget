import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('exportExcel_duration');

export function exportExcel() {
  const url = `${BASE_URL}/api/transactions/export/excel`;
  sendGet(url, SEEDED_USER.userId, 'exportExcel', (body) => body.success === true, durationTrend);
}
