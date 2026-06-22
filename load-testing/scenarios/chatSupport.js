import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('chatSupport_duration');

export function chatSupport() {
  const url = `${BASE_URL}/api/support/chat`;
  const payload = {
  "message": "Need help"
};
  sendPost(url, payload, SEEDED_USER.userId, 'chatSupport', (body) => body.reply !== undefined, durationTrend);
}
