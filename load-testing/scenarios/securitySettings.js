import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('securitySettings_duration');

export function securitySettings() {
  const url = `${BASE_URL}/api/settings/security`;
  sendGet(url, SEEDED_USER.userId, 'securitySettings', (body) => body.lastPasswordChange !== undefined, durationTrend);
}
