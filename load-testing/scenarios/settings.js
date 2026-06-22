import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('settings_duration');

export function settings() {
  const url = `${BASE_URL}/api/settings`;
  sendGet(url, SEEDED_USER.userId, 'settings', (body) => body.theme !== undefined, durationTrend);
}
