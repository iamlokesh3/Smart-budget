import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';

describe('Budget', function () {
  let loginPage;
  let dashboardPage;

  before(async function () {
    loginPage = new LoginPage(global.driverInstance);
    dashboardPage = new DashboardPage(global.driverInstance);
    await loginPage.navigate();
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    await dashboardPage.navigateTo('Budget Planner');
  });

  it('TC_BUDGET_031 - Load Budget Planner Page', async function () {
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });
});
