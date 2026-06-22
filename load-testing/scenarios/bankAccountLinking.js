import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('bankAccountLinking_duration');

export function bankAccountLinking() {
  const url = `${BASE_URL}/api/bank-accounts`;
  const payload = {
  "bankName": "HDFC",
  "accountNumber": "9876543210"
};
  sendPost(url, payload, SEEDED_USER.userId, 'bankAccountLinking', (body) => body.success === true, durationTrend);
}
