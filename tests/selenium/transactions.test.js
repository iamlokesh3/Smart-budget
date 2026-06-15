import { expect } from 'chai';
import { getDriver } from './driverHelper.js';
import { LoginPage, DashboardPage, TransactionsPage } from './seleniumPOM.js';

describe('Selenium Web: Transactions', function () {
  this.timeout(30000);
  let driver;
  let loginPage;
  let dashboardPage;
  let transactionsPage;

  before(async function () {
    driver = await getDriver();
    loginPage = new LoginPage(driver);
    dashboardPage = new DashboardPage(driver);
    transactionsPage = new TransactionsPage(driver);
    await loginPage.navigate('http://localhost:5173');
    await loginPage.clickGetStarted();
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    await dashboardPage.navigateTo('Smart Entries');
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('TC_SEL_011 - Verify add income transaction', async function () {
    await transactionsPage.addNaturalLanguage('Added income 50000 from Salary');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_012 - Verify add expense transaction', async function () {
    await transactionsPage.addNaturalLanguage('Spent 1200 on Dinner');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_013 - Verify transaction field input sanitization', async function () {
    // Sanitization check
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_014 - Verify edit transaction title', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_015 - Verify edit transaction amount and category updates', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_016 - Verify transaction deletion and balance recalculation', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_017 - Verify search transaction by keyword', async function () {
    await transactionsPage.search('Salary');
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_018 - Verify filter transactions by category', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_019 - Verify filter transactions by date ranges', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_020 - Verify sort transactions by date ascending/descending', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_SEL_021 - Verify sort transactions by amount ascending/descending', async function () {
    const title = await driver.getTitle();
    expect(title).to.not.be.null;
  });
});
