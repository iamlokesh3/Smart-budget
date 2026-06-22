import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('aiRecommendations_duration');

export function aiRecommendations() {
  const url = `${BASE_URL}/api/ai/recommendations`;
  sendGet(url, SEEDED_USER.userId, 'aiRecommendations', (body) => body.recommendations !== undefined, durationTrend);
}
