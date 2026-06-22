import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('login_duration');

export function login() {
  const url = `${BASE_URL}/api/auth/login`;
  const payload = {
  "email": "lokeshmk436@gmail.com"
};
  sendPost(url, payload, SEEDED_USER.userId, 'login', (body) => body.email === "lokeshmk436@gmail.com", durationTrend);
}
