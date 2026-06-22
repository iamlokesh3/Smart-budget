import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scenarios = [
  { name: 'login', method: 'POST', path: '/api/auth/login', body: { email: 'lokeshmk436@gmail.com' }, validator: 'body.email === "lokeshmk436@gmail.com"' },
  { 
    name: 'register', 
    method: 'POST', 
    path: '/api/auth/register', 
    isDynamic: true,
    payloadCode: `{
    id: 'user-' + __VU + '-' + __ITER + '-' + Math.floor(Math.random() * 1000000),
    name: 'New User',
    email: 'new_user_' + __VU + '_' + __ITER + '_' + Math.floor(Math.random() * 1000000) + '@test.com',
    joinedAt: new Date().toISOString()
  }`, 
    validator: 'body.success === true' 
  },
  { name: 'forgotPassword', method: 'POST', path: '/api/auth/forgot-password', body: { email: 'lokeshmk436@gmail.com' }, validator: 'body.success === true' },
  { name: 'otpVerification', method: 'POST', path: '/api/auth/verify-otp', body: { email: 'lokeshmk436@gmail.com', otp: '123456' }, validator: 'body.success === true && body.token !== undefined' },
  { name: 'dashboard', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { 
    name: 'smartEntry', 
    method: 'POST', 
    path: '/api/transactions', 
    isDynamic: true,
    payloadCode: `{
    id: 'tx-smart-' + __VU + '-' + __ITER + '-' + Math.floor(Math.random() * 1000000),
    raw: 'Dinner INR 1500',
    title: 'Dinner',
    amount: 1500,
    category: 'Food',
    categoryIcon: '🍔',
    categoryColor: '#ef4444',
    date: new Date().toISOString(),
    dateLabel: 'Today',
    type: 'expense'
  }`, 
    validator: 'body.success === true' 
  },
  { name: 'ocrReceiptUpload', method: 'POST', path: '/api/transactions/ocr', body: { imageBase64: 'mock-image-data' }, validator: 'body.success === true && body.extracted !== undefined' },
  { name: 'aiAdvisor', method: 'POST', path: '/api/ai/chat', body: { message: 'How do I save money?' }, validator: 'body.reply !== undefined' },
  { name: 'budgetPlanner', method: 'GET', path: '/api/budgets', validator: 'Array.isArray(body)' },
  { name: 'goals', method: 'GET', path: '/api/goals', validator: 'Array.isArray(body)' },
  { name: 'savingsGoals', method: 'GET', path: '/api/goals', validator: 'Array.isArray(body)' },
  { name: 'expenseList', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { 
    name: 'addExpense', 
    method: 'POST', 
    path: '/api/transactions', 
    isDynamic: true,
    payloadCode: `{
    id: 'tx-add-' + __VU + '-' + __ITER + '-' + Math.floor(Math.random() * 1000000),
    raw: 'Taxi INR 500',
    title: 'Taxi Ride',
    amount: 500,
    category: 'Transport',
    categoryIcon: '🚌',
    categoryColor: '#3b82f6',
    date: new Date().toISOString(),
    dateLabel: 'Today',
    type: 'expense'
  }`, 
    validator: 'body.success === true' 
  },
  { name: 'editExpense', method: 'PUT', path: '/api/transactions/tx-edit-mock', body: { title: 'Updated Taxi Ride' }, validator: 'body.success === true' },
  { name: 'deleteExpense', method: 'DELETE', path: '/api/transactions/tx-delete-mock', validator: 'body.success === true' },
  { name: 'reports', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { name: 'dailyReport', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { name: 'weeklyReport', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { name: 'monthlyReport', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { name: 'categoryAnalysis', method: 'GET', path: '/api/transactions/analytics', validator: 'body.topCategories !== undefined' },
  { 
    name: 'incomeManagement', 
    method: 'POST', 
    path: '/api/transactions', 
    isDynamic: true,
    payloadCode: `{
    id: 'tx-inc-' + __VU + '-' + __ITER + '-' + Math.floor(Math.random() * 1000000),
    raw: 'Salary INR 80000',
    title: 'Salary',
    amount: 80000,
    category: 'Salary',
    categoryIcon: '💰',
    categoryColor: '#10b981',
    date: new Date().toISOString(),
    dateLabel: 'Today',
    type: 'income'
  }`, 
    validator: 'body.success === true' 
  },
  { name: 'notifications', method: 'GET', path: '/api/notifications', validator: 'Array.isArray(body)' },
  { name: 'userProfile', method: 'GET', path: '/api/profile', validator: 'body.email !== undefined' },
  { name: 'settings', method: 'GET', path: '/api/settings', validator: 'body.theme !== undefined' },
  { name: 'darkMode', method: 'POST', path: '/api/settings/theme', body: { theme: 'dark' }, validator: 'body.success === true' },
  { name: 'currencySettings', method: 'POST', path: '/api/settings/currency', body: { currency: 'INR' }, validator: 'body.success === true' },
  { name: 'bankAccountLinking', method: 'POST', path: '/api/bank-accounts', body: { bankName: 'HDFC', accountNumber: '9876543210' }, validator: 'body.success === true' },
  { name: 'transactionHistory', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { name: 'searchExpenses', method: 'GET', path: '/api/transactions', validator: 'Array.isArray(body)' },
  { name: 'exportPdf', method: 'GET', path: '/api/transactions/export/pdf', validator: 'body.success === true' },
  { name: 'exportExcel', method: 'GET', path: '/api/transactions/export/excel', validator: 'body.success === true' },
  { name: 'qrPayment', method: 'POST', path: '/api/payments/qr-scan', body: { qrData: 'upi://pay?pa=lokesh@upi', amount: 200 }, validator: 'body.success === true' },
  { name: 'chatSupport', method: 'POST', path: '/api/support/chat', body: { message: 'Need help' }, validator: 'body.reply !== undefined' },
  { name: 'aiRecommendations', method: 'GET', path: '/api/ai/recommendations', validator: 'body.recommendations !== undefined' },
  { name: 'spendingAnalytics', method: 'GET', path: '/api/transactions/analytics', validator: 'body.monthlySpending !== undefined' },
  { name: 'pieChartDashboard', method: 'GET', path: '/api/transactions/charts/pie', validator: 'body.labels !== undefined' },
  { name: 'barChartDashboard', method: 'GET', path: '/api/transactions/charts/bar', validator: 'body.labels !== undefined' },
  { name: 'securitySettings', method: 'GET', path: '/api/settings/security', validator: 'body.lastPasswordChange !== undefined' },
  { name: 'changePassword', method: 'POST', path: '/api/settings/change-password', body: { oldPassword: 'password123', newPassword: 'newpassword123' }, validator: 'body.success === true' },
  { name: 'logout', method: 'POST', path: '/api/auth/logout', body: {}, validator: 'body.success === true' }
];

const scenariosDir = path.join(__dirname, '..', 'scenarios');
if (!fs.existsSync(scenariosDir)) {
  fs.mkdirSync(scenariosDir, { recursive: true });
}

scenarios.forEach(sc => {
  const filePath = path.join(scenariosDir, `${sc.name}.js`);
  let content = '';

  if (sc.method === 'GET') {
    content = `import { sendGet } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('${sc.name}_duration');

export function ${sc.name}() {
  const url = \`\${BASE_URL}${sc.path}\`;
  sendGet(url, SEEDED_USER.userId, '${sc.name}', (body) => ${sc.validator}, durationTrend);
}
`;
  } else if (sc.method === 'POST') {
    const payloadStr = sc.isDynamic ? sc.payloadCode : JSON.stringify(sc.body, null, 2);
    content = `import { sendPost } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('${sc.name}_duration');

export function ${sc.name}() {
  const url = \`\${BASE_URL}${sc.path}\`;
  const payload = ${payloadStr};
  sendPost(url, payload, SEEDED_USER.userId, '${sc.name}', (body) => ${sc.validator}, durationTrend);
}
`;
  } else if (sc.method === 'PUT') {
    content = `import { sendPut } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('${sc.name}_duration');

export function ${sc.name}() {
  const url = \`\${BASE_URL}${sc.path}\`;
  const payload = ${JSON.stringify(sc.body, null, 2)};
  sendPut(url, payload, SEEDED_USER.userId, '${sc.name}', (body) => ${sc.validator}, durationTrend);
}
`;
  } else if (sc.method === 'DELETE') {
    content = `import { sendDelete } from '../utils/utils.js';
import { BASE_URL } from '../config/config.js';
import { SEEDED_USER } from '../data/data.js';
import { Trend } from 'k6/metrics';

const durationTrend = new Trend('${sc.name}_duration');

export function ${sc.name}() {
  const url = \`\${BASE_URL}${sc.path}\`;
  sendDelete(url, SEEDED_USER.userId, '${sc.name}', (body) => ${sc.validator}, durationTrend);
}
`;
  }

  fs.writeFileSync(filePath, content);
  console.log(`Generated: ${sc.name}.js`);
});
