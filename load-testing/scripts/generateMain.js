import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scenarioNames = [
  'login', 'register', 'forgotPassword', 'otpVerification', 'dashboard', 'smartEntry',
  'ocrReceiptUpload', 'aiAdvisor', 'budgetPlanner', 'goals', 'savingsGoals', 'expenseList',
  'addExpense', 'editExpense', 'deleteExpense', 'reports', 'dailyReport', 'weeklyReport',
  'monthlyReport', 'categoryAnalysis', 'incomeManagement', 'notifications', 'userProfile',
  'settings', 'darkMode', 'currencySettings', 'bankAccountLinking', 'transactionHistory',
  'searchExpenses', 'exportPdf', 'exportExcel', 'qrPayment', 'chatSupport', 'aiRecommendations',
  'spendingAnalytics', 'pieChartDashboard', 'barChartDashboard', 'securitySettings',
  'changePassword', 'logout'
];

let imports = "";
let scenarioConfigs = "";
let exportsList = "";

scenarioNames.forEach(name => {
  imports += `import { ${name} } from './scenarios/${name}.js';\n`;
  scenarioConfigs += `    ${name}: {
      executor: 'constant-vus',
      exec: 'run_${name}',
      vus: VUS,
      duration: TEST_DURATION,
    },\n`;
  exportsList += `export function run_${name}() {
  ${name}();
}\n\n`;
});

const fileContent = `/**
 * Smart Budget AI Load Testing — Main Test Execution
 * Central runner for all 40 scenarios.
 */
import { VUS, TEST_DURATION, THRESHOLDS } from './config/config.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

${imports}

export const options = {
  scenarios: {
${scenarioConfigs}  },
  thresholds: THRESHOLDS,
};

${exportsList}

export function handleSummary(data) {
  return {
    'reports/summary.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'main.js'), fileContent);
console.log("main.js generated with handleSummary!");
