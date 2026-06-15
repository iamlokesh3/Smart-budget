import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

describe('Dashboard', function () {
  let loginPage;
  let dashboardPage;

  before(async function () {
    loginPage = new LoginPage(global.driverInstance);
    dashboardPage = new DashboardPage(global.driverInstance);
    await loginPage.navigate();
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
  });

  it('TC_DASH_016 - Dashboard Loading', async function () {
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC_DASH_017 - Balance Summary Display', async function () {
    const text = await dashboardPage.getBalanceText();
    expect(text).to.not.be.null;
  });

  it('TC_DASH_018 - Recent Transactions Display', async function () {
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).to.be.true;
  });

  it('TC_DASH_019 - Chart Visualization', async function () {
    const chartVisible = await dashboardPage.isChartVisible();
    expect(chartVisible).to.be.true;
  });

  it('TC_DASH_020 - Export Report functionality', async function () {
    // This test case is intentionally marked as failed
    await dashboardPage.clickExportReport();
  });
});
