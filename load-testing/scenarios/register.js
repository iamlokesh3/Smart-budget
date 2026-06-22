import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('register_duration');

export function register() {
  const url = `${BASE_URL}/api/auth/register`;
  const payload = {
  "id": "new-user-12345",
  "name": "New User",
  "email": "new_user_12345@test.com",
  "joinedAt": "2026-06-22T04:15:01.520Z"
};
  sendPost(url, payload, SEEDED_USER.userId, 'register', (body) => body.success === true, durationTrend);
}
