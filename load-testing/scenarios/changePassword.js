import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('changePassword_duration');

export function changePassword() {
  const url = `${BASE_URL}/api/settings/change-password`;
  const payload = {
  "oldPassword": "password123",
  "newPassword": "newpassword123"
};
  sendPost(url, payload, SEEDED_USER.userId, 'changePassword', (body) => body.success === true, durationTrend);
}
