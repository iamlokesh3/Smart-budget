import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('incomeManagement_duration');

export function incomeManagement() {
  const url = `${BASE_URL}/api/transactions`;
  const payload = {
  "id": "tx-inc-123",
  "raw": "Salary INR 80000",
  "title": "Salary",
  "amount": 80000,
  "category": "Salary",
  "categoryIcon": "💰",
  "categoryColor": "#10b981",
  "date": "2026-06-22T04:15:01.523Z",
  "dateLabel": "Today",
  "type": "income"
};
  sendPost(url, payload, SEEDED_USER.userId, 'incomeManagement', (body) => body.success === true, durationTrend);
}
