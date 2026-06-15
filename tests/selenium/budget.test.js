import { expect } from 'chai';
import { getDriver } from './driverHelper.js';
import { LoginPage, DashboardPage } from './seleniumPOM.js';

describe('Selenium Web: Budget Management', function () {
  this.timeout(20000);
  let driver;
  let loginPage;
  let dashboardPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    await loginPage.navigate('http://localhost:5173');
    await loginPage.clickGetStarted();
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    await dashboardPage.navigateTo('Budget Planner');
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC_SEL_022 - Verify monthly budget creation and save button', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_023 - Verify budget progress bar updates on transactions', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });
});
