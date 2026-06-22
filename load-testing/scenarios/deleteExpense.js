import { sendDelete } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('deleteExpense_duration');

export function deleteExpense() {
  const url = `${BASE_URL}/api/transactions/tx-delete-mock`;
  sendDelete(url, SEEDED_USER.userId, 'deleteExpense', (body) => body.success === true, durationTrend);
}
