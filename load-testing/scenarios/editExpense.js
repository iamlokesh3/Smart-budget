import { sendPut } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('editExpense_duration');

export function editExpense() {
  const url = `${BASE_URL}/api/transactions/tx-edit-mock`;
  const payload = {
  "title": "Updated Taxi Ride"
};
  sendPut(url, payload, SEEDED_USER.userId, 'editExpense', (body) => body.success === true, durationTrend);
}
