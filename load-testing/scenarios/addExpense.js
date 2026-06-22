import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('addExpense_duration');

export function addExpense() {
  const url = `${BASE_URL}/api/transactions`;
  const payload = {
  "id": "tx-add-123",
  "raw": "Taxi INR 500",
  "title": "Taxi Ride",
  "amount": 500,
  "category": "Transport",
  "categoryIcon": "🚌",
  "categoryColor": "#3b82f6",
  "date": "2026-06-22T04:15:01.523Z",
  "dateLabel": "Today",
  "type": "expense"
};
  sendPost(url, payload, SEEDED_USER.userId, 'addExpense', (body) => body.success === true, durationTrend);
}
