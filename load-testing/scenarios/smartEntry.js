import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('smartEntry_duration');

export function smartEntry() {
  const url = `${BASE_URL}/api/transactions`;
  const payload = {
  "id": "tx-smart-123",
  "raw": "Dinner INR 1500",
  "title": "Dinner",
  "amount": 1500,
  "category": "Food",
  "categoryIcon": "🍔",
  "categoryColor": "#ef4444",
  "date": "2026-06-22T04:15:01.523Z",
  "dateLabel": "Today",
  "type": "expense"
};
  sendPost(url, payload, SEEDED_USER.userId, 'smartEntry', (body) => body.success === true, durationTrend);
}
