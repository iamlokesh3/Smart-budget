import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('ocrReceiptUpload_duration');

export function ocrReceiptUpload() {
  const url = `${BASE_URL}/api/transactions/ocr`;
  const payload = {
  "imageBase64": "mock-image-data"
};
  sendPost(url, payload, SEEDED_USER.userId, 'ocrReceiptUpload', (body) => body.success === true && body.extracted !== undefined, durationTrend);
}
