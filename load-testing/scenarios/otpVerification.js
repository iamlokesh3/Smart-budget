import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('otpVerification_duration');

export function otpVerification() {
  const url = `${BASE_URL}/api/auth/verify-otp`;
  const payload = {
  "email": "lokeshmk436@gmail.com",
  "otp": "123456"
};
  sendPost(url, payload, SEEDED_USER.userId, 'otpVerification', (body) => body.success === true && body.token !== undefined, durationTrend);
}
