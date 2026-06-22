import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('aiAdvisor_duration');

export function aiAdvisor() {
  const url = `${BASE_URL}/api/ai/chat`;
  const payload = {
  "message": "How do I save money?"
};
  sendPost(url, payload, SEEDED_USER.userId, 'aiAdvisor', (body) => body.reply !== undefined, durationTrend);
}
