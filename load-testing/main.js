/**
 * Smart Budget AI Load Testing — Main Test Execution
 * Central runner for all 40 scenarios.
 */
import { VUS, TEST_DURATION, THRESHOLDS } from './config/config.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

import { login } from './scenarios/login.js';
import { register } from './scenarios/register.js';
import { forgotPassword } from './scenarios/forgotPassword.js';
import { otpVerification } from './scenarios/otpVerification.js';
import { dashboard } from './scenarios/dashboard.js';
import { smartEntry } from './scenarios/smartEntry.js';
import { ocrReceiptUpload } from './scenarios/ocrReceiptUpload.js';
import { aiAdvisor } from './scenarios/aiAdvisor.js';
import { budgetPlanner } from './scenarios/budgetPlanner.js';
import { goals } from './scenarios/goals.js';
import { savingsGoals } from './scenarios/savingsGoals.js';
import { expenseList } from './scenarios/expenseList.js';
import { addExpense } from './scenarios/addExpense.js';
import { editExpense } from './scenarios/editExpense.js';
import { deleteExpense } from './scenarios/deleteExpense.js';
import { reports } from './scenarios/reports.js';
import { dailyReport } from './scenarios/dailyReport.js';
import { weeklyReport } from './scenarios/weeklyReport.js';
import { monthlyReport } from './scenarios/monthlyReport.js';
import { categoryAnalysis } from './scenarios/categoryAnalysis.js';
import { incomeManagement } from './scenarios/incomeManagement.js';
import { notifications } from './scenarios/notifications.js';
import { userProfile } from './scenarios/userProfile.js';
import { settings } from './scenarios/settings.js';
import { darkMode } from './scenarios/darkMode.js';
import { currencySettings } from './scenarios/currencySettings.js';
import { bankAccountLinking } from './scenarios/bankAccountLinking.js';
import { transactionHistory } from './scenarios/transactionHistory.js';
import { searchExpenses } from './scenarios/searchExpenses.js';
import { exportPdf } from './scenarios/exportPdf.js';
import { exportExcel } from './scenarios/exportExcel.js';
import { qrPayment } from './scenarios/qrPayment.js';
import { chatSupport } from './scenarios/chatSupport.js';
import { aiRecommendations } from './scenarios/aiRecommendations.js';
import { spendingAnalytics } from './scenarios/spendingAnalytics.js';
import { pieChartDashboard } from './scenarios/pieChartDashboard.js';
import { barChartDashboard } from './scenarios/barChartDashboard.js';
import { securitySettings } from './scenarios/securitySettings.js';
import { changePassword } from './scenarios/changePassword.js';
import { logout } from './scenarios/logout.js';


export const options = {
  scenarios: {
    login: {
      executor: 'constant-vus',
      exec: 'run_login',
      vus: VUS,
      duration: TEST_DURATION,
    },
    register: {
      executor: 'constant-vus',
      exec: 'run_register',
      vus: VUS,
      duration: TEST_DURATION,
    },
    forgotPassword: {
      executor: 'constant-vus',
      exec: 'run_forgotPassword',
      vus: VUS,
      duration: TEST_DURATION,
    },
    otpVerification: {
      executor: 'constant-vus',
      exec: 'run_otpVerification',
      vus: VUS,
      duration: TEST_DURATION,
    },
    dashboard: {
      executor: 'constant-vus',
      exec: 'run_dashboard',
      vus: VUS,
      duration: TEST_DURATION,
    },
    smartEntry: {
      executor: 'constant-vus',
      exec: 'run_smartEntry',
      vus: VUS,
      duration: TEST_DURATION,
    },
    ocrReceiptUpload: {
      executor: 'constant-vus',
      exec: 'run_ocrReceiptUpload',
      vus: VUS,
      duration: TEST_DURATION,
    },
    aiAdvisor: {
      executor: 'constant-vus',
      exec: 'run_aiAdvisor',
      vus: VUS,
      duration: TEST_DURATION,
    },
    budgetPlanner: {
      executor: 'constant-vus',
      exec: 'run_budgetPlanner',
      vus: VUS,
      duration: TEST_DURATION,
    },
    goals: {
      executor: 'constant-vus',
      exec: 'run_goals',
      vus: VUS,
      duration: TEST_DURATION,
    },
    savingsGoals: {
      executor: 'constant-vus',
      exec: 'run_savingsGoals',
      vus: VUS,
      duration: TEST_DURATION,
    },
    expenseList: {
      executor: 'constant-vus',
      exec: 'run_expenseList',
      vus: VUS,
      duration: TEST_DURATION,
    },
    addExpense: {
      executor: 'constant-vus',
      exec: 'run_addExpense',
      vus: VUS,
      duration: TEST_DURATION,
    },
    editExpense: {
      executor: 'constant-vus',
      exec: 'run_editExpense',
      vus: VUS,
      duration: TEST_DURATION,
    },
    deleteExpense: {
      executor: 'constant-vus',
      exec: 'run_deleteExpense',
      vus: VUS,
      duration: TEST_DURATION,
    },
    reports: {
      executor: 'constant-vus',
      exec: 'run_reports',
      vus: VUS,
      duration: TEST_DURATION,
    },
    dailyReport: {
      executor: 'constant-vus',
      exec: 'run_dailyReport',
      vus: VUS,
      duration: TEST_DURATION,
    },
    weeklyReport: {
      executor: 'constant-vus',
      exec: 'run_weeklyReport',
      vus: VUS,
      duration: TEST_DURATION,
    },
    monthlyReport: {
      executor: 'constant-vus',
      exec: 'run_monthlyReport',
      vus: VUS,
      duration: TEST_DURATION,
    },
    categoryAnalysis: {
      executor: 'constant-vus',
      exec: 'run_categoryAnalysis',
      vus: VUS,
      duration: TEST_DURATION,
    },
    incomeManagement: {
      executor: 'constant-vus',
      exec: 'run_incomeManagement',
      vus: VUS,
      duration: TEST_DURATION,
    },
    notifications: {
      executor: 'constant-vus',
      exec: 'run_notifications',
      vus: VUS,
      duration: TEST_DURATION,
    },
    userProfile: {
      executor: 'constant-vus',
      exec: 'run_userProfile',
      vus: VUS,
      duration: TEST_DURATION,
    },
    settings: {
      executor: 'constant-vus',
      exec: 'run_settings',
      vus: VUS,
      duration: TEST_DURATION,
    },
    darkMode: {
      executor: 'constant-vus',
      exec: 'run_darkMode',
      vus: VUS,
      duration: TEST_DURATION,
    },
    currencySettings: {
      executor: 'constant-vus',
      exec: 'run_currencySettings',
      vus: VUS,
      duration: TEST_DURATION,
    },
    bankAccountLinking: {
      executor: 'constant-vus',
      exec: 'run_bankAccountLinking',
      vus: VUS,
      duration: TEST_DURATION,
    },
    transactionHistory: {
      executor: 'constant-vus',
      exec: 'run_transactionHistory',
      vus: VUS,
      duration: TEST_DURATION,
    },
    searchExpenses: {
      executor: 'constant-vus',
      exec: 'run_searchExpenses',
      vus: VUS,
      duration: TEST_DURATION,
    },
    exportPdf: {
      executor: 'constant-vus',
      exec: 'run_exportPdf',
      vus: VUS,
      duration: TEST_DURATION,
    },
    exportExcel: {
      executor: 'constant-vus',
      exec: 'run_exportExcel',
      vus: VUS,
      duration: TEST_DURATION,
    },
    qrPayment: {
      executor: 'constant-vus',
      exec: 'run_qrPayment',
      vus: VUS,
      duration: TEST_DURATION,
    },
    chatSupport: {
      executor: 'constant-vus',
      exec: 'run_chatSupport',
      vus: VUS,
      duration: TEST_DURATION,
    },
    aiRecommendations: {
      executor: 'constant-vus',
      exec: 'run_aiRecommendations',
      vus: VUS,
      duration: TEST_DURATION,
    },
    spendingAnalytics: {
      executor: 'constant-vus',
      exec: 'run_spendingAnalytics',
      vus: VUS,
      duration: TEST_DURATION,
    },
    pieChartDashboard: {
      executor: 'constant-vus',
      exec: 'run_pieChartDashboard',
      vus: VUS,
      duration: TEST_DURATION,
    },
    barChartDashboard: {
      executor: 'constant-vus',
      exec: 'run_barChartDashboard',
      vus: VUS,
      duration: TEST_DURATION,
    },
    securitySettings: {
      executor: 'constant-vus',
      exec: 'run_securitySettings',
      vus: VUS,
      duration: TEST_DURATION,
    },
    changePassword: {
      executor: 'constant-vus',
      exec: 'run_changePassword',
      vus: VUS,
      duration: TEST_DURATION,
    },
    logout: {
      executor: 'constant-vus',
      exec: 'run_logout',
      vus: VUS,
      duration: TEST_DURATION,
    },
  },
  thresholds: THRESHOLDS,
};

export function run_login() {
  login();
}

export function run_register() {
  register();
}

export function run_forgotPassword() {
  forgotPassword();
}

export function run_otpVerification() {
  otpVerification();
}

export function run_dashboard() {
  dashboard();
}

export function run_smartEntry() {
  smartEntry();
}

export function run_ocrReceiptUpload() {
  ocrReceiptUpload();
}

export function run_aiAdvisor() {
  aiAdvisor();
}

export function run_budgetPlanner() {
  budgetPlanner();
}

export function run_goals() {
  goals();
}

export function run_savingsGoals() {
  savingsGoals();
}

export function run_expenseList() {
  expenseList();
}

export function run_addExpense() {
  addExpense();
}

export function run_editExpense() {
  editExpense();
}

export function run_deleteExpense() {
  deleteExpense();
}

export function run_reports() {
  reports();
}

export function run_dailyReport() {
  dailyReport();
}

export function run_weeklyReport() {
  weeklyReport();
}

export function run_monthlyReport() {
  monthlyReport();
}

export function run_categoryAnalysis() {
  categoryAnalysis();
}

export function run_incomeManagement() {
  incomeManagement();
}

export function run_notifications() {
  notifications();
}

export function run_userProfile() {
  userProfile();
}

export function run_settings() {
  settings();
}

export function run_darkMode() {
  darkMode();
}

export function run_currencySettings() {
  currencySettings();
}

export function run_bankAccountLinking() {
  bankAccountLinking();
}

export function run_transactionHistory() {
  transactionHistory();
}

export function run_searchExpenses() {
  searchExpenses();
}

export function run_exportPdf() {
  exportPdf();
}

export function run_exportExcel() {
  exportExcel();
}

export function run_qrPayment() {
  qrPayment();
}

export function run_chatSupport() {
  chatSupport();
}

export function run_aiRecommendations() {
  aiRecommendations();
}

export function run_spendingAnalytics() {
  spendingAnalytics();
}

export function run_pieChartDashboard() {
  pieChartDashboard();
}

export function run_barChartDashboard() {
  barChartDashboard();
}

export function run_securitySettings() {
  securitySettings();
}

export function run_changePassword() {
  changePassword();
}

export function run_logout() {
  logout();
}



export function handleSummary(data) {
  return {
    'reports/summary.json': JSON.stringify(data, null, 2),
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}
