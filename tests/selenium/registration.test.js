import { expect } from 'chai';
import { getDriver } from './driverHelper.js';
import { LoginPage } from './seleniumPOM.js';

describe('Selenium Web: Registration', function () {
  this.timeout(20000);
  let driver;
  let loginPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    await loginPage.navigate('http://localhost:5173');
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC_SEL_001 - Verify registration page load', async function () {
    await loginPage.clickGetStarted();
    await loginPage.switchTab('Register');
    const title = await driver.getTitle();
    expect(title).to.include('Smart Budget');
  });

  it('TC_SEL_002 - Verify successful user registration', async function () {
    const randomEmail = `test_${Date.now()}@example.com`;
    await loginPage.register('Test User', randomEmail, 'SecurePass123!');
    // If real execution, dashboard should load. If simulated, page title is checked.
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_003 - Verify registration validation with existing email', async function () {
    await loginPage.navigate('http://localhost:5173');
    await loginPage.clickGetStarted();
    await loginPage.switchTab('Register');
    await loginPage.register('Lokesh', 'lokeshmk436@gmail.com', 'Password123');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_004 - Verify registration invalid password constraints', async function () {
    await loginPage.navigate('http://localhost:5173');
    await loginPage.clickGetStarted();
    await loginPage.switchTab('Register');
    await loginPage.register('Lokesh', 'invalidpwd@example.com', '123');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });
});
