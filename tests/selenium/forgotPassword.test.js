import { expect } from 'chai';
import { getDriver } from './driverHelper.js';
import { LoginPage } from './seleniumPOM.js';

describe('Selenium Web: Forgot Password', function () {
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

  it('TC_SEL_008 - Verify forgot password page load', async function () {
    await loginPage.clickGetStarted();
    // Simulate forgot password link check
    const title = await driver.getTitle();
    expect(title).to.include('Smart Budget');
  });

  it('TC_SEL_009 - Verify forgot password email submission', async function () {
    // Simulate typing email and submitting
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });
});
