import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('userProfile_duration');

export function userProfile() {
  const url = `${BASE_URL}/api/profile`;
  sendGet(url, SEEDED_USER.userId, 'userProfile', (body) => body.email !== undefined, durationTrend);
}
