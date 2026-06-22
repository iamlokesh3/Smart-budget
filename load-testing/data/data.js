/**
 * K6 Load Testing Test Data and Generators
 */
export const SEEDED_USER = {
  email: 'lokeshmk436@gmail.com',
  userId: '1781096350731',
  name: 'Lokesh',
};

export function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function makeRandomEmail() {
  return `user_${Date.now()}_${getRandomInt(1000, 9999)}@test.com`;
}
