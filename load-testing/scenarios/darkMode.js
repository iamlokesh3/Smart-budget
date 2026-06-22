import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('darkMode_duration');

export function darkMode() {
  const url = `${BASE_URL}/api/settings/theme`;
  const payload = {
  "theme": "dark"
};
  sendPost(url, payload, SEEDED_USER.userId, 'darkMode', (body) => body.success === true, durationTrend);
}
