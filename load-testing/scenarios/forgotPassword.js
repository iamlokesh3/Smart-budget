import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('forgotPassword_duration');

export function forgotPassword() {
  const url = `${BASE_URL}/api/auth/forgot-password`;
  const payload = {
  "email": "lokeshmk436@gmail.com"
};
  sendPost(url, payload, SEEDED_USER.userId, 'forgotPassword', (body) => body.success === true, durationTrend);
}
