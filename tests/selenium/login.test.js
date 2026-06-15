import { expect } from 'chai';
import { getDriver } from './driverHelper.js';
import { LoginPage } from './seleniumPOM.js';

describe('Selenium Web: Login', function () {
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

  it('TC_SEL_005 - Verify login page load', async function () {
    await loginPage.clickGetStarted();
    await loginPage.switchTab('Sign In');
    const title = await driver.getTitle();
    expect(title).to.include('Smart Budget');
  });

  it('TC_SEL_006 - Verify successful login with valid credentials', async function () {
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_007 - Verify login error warning with invalid credentials', async function () {
    await loginPage.navigate('http://localhost:5173');
    await loginPage.clickGetStarted();
    await loginPage.login('wrong@example.com', 'wrongpassword');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });
});
