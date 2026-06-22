import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('currencySettings_duration');

export function currencySettings() {
  const url = `${BASE_URL}/api/settings/currency`;
  const payload = {
  "currency": "INR"
};
  sendPost(url, payload, SEEDED_USER.userId, 'currencySettings', (body) => body.success === true, durationTrend);
}
