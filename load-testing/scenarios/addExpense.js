import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('addExpense_duration');

export function addExpense() {
  const url = `${BASE_URL}/api/transactions`;
  const payload = {
    id: 'tx-add-' + __VU + '-' + __ITER + '-' + Math.floor(Math.random() * 1000000),
    raw: 'Taxi INR 500',
    title: 'Taxi Ride',
    amount: 500,
    category: 'Transport',
    categoryIcon: '🚌',
    categoryColor: '#3b82f6',
    date: new Date().toISOString(),
    dateLabel: 'Today',
    type: 'expense'
  };
  sendPost(url, payload, SEEDED_USER.userId, 'addExpense', (body) => body.success === true, durationTrend);
}
