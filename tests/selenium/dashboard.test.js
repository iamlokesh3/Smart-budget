import { expect } from 'chai';
import { getDriver } from './driverHelper.js';
import { LoginPage, DashboardPage } from './seleniumPOM.js';

describe('Selenium Web: Dashboard', function () {
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
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC_SEL_010 - Verify dashboard load and initial welcome metrics', async function () {
    const isLoaded = await dashboardPage.isLoaded();
    expect(isLoaded).to.be.true;
  });
});
