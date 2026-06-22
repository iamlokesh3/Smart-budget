import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('register_duration');

export function register() {
  const url = `${BASE_URL}/api/auth/register`;
  const payload = {
    id: 'user-' + __VU + '-' + __ITER + '-' + Math.floor(Math.random() * 1000000),
    name: 'New User',
    email: 'new_user_' + __VU + '_' + __ITER + '_' + Math.floor(Math.random() * 1000000) + '@test.com',
    joinedAt: new Date().toISOString()
  };
  sendPost(url, payload, SEEDED_USER.userId, 'register', (body) => body.success === true, durationTrend);
}
