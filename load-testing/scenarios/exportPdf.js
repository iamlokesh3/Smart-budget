import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('exportPdf_duration');

export function exportPdf() {
  const url = `${BASE_URL}/api/transactions/export/pdf`;
  sendGet(url, SEEDED_USER.userId, 'exportPdf', (body) => body.success === true, durationTrend);
}
