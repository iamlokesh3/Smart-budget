import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('qrPayment_duration');

export function qrPayment() {
  const url = `${BASE_URL}/api/payments/qr-scan`;
  const payload = {
  "qrData": "upi://pay?pa=lokesh@upi",
  "amount": 200
};
  sendPost(url, payload, SEEDED_USER.userId, 'qrPayment', (body) => body.success === true, durationTrend);
}
