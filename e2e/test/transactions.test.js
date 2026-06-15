import { Builder, By, until, Key } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { expect } from 'chai';

describe('Transactions E2E Tests', function () {
  this.timeout(30000);
  let driver;
  const URL = 'http://localhost:5173';

  before(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless=new'); // Enable headless mode
    options.addArguments('--window-size=1280,800');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  it('should log in to access the dashboard', async function () {
    await driver.get(URL);
    const loginBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Login")]')), 5000);
    await driver.wait(until.elementIsVisible(loginBtn), 5000);
    await loginBtn.click();

    await driver.wait(until.elementLocated(By.className('auth-card')), 5000);

    const emailInput = await driver.findElement(By.css('input[type="email"]'));
    await emailInput.sendKeys('lokeshmk436@gmail.com');

    const pwInput = await driver.findElement(By.css('input[type="password"]'));
    await pwInput.sendKeys('password123');

    const submitBtn = await driver.findElement(By.xpath('//button[contains(text(), "Sign In")]'));
    await submitBtn.click();

    const dashboardGrid = await driver.wait(until.elementLocated(By.className('action-grid')), 5000);
    expect(dashboardGrid).to.not.be.null;
  });

  it('should navigate to Smart Entries page', async function () {
    // Click the Smart Entries card on the dashboard
    const entriesCard = await driver.findElement(By.xpath('//h4[text()="Smart Entries"]/..'));
    await entriesCard.click();

    // Verify we are on the entries page
    const pageHeader = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000);
    const text = await pageHeader.getText();
    expect(text).to.include('Smart Entries');
  });

  it('should add a new natural language transaction', async function () {
    const inputField = await driver.findElement(By.className('entry-input'));
    await inputField.sendKeys('Spent ₹450 on concert tickets');

    const submitBtn = await driver.findElement(By.className('entry-submit-btn'));
    await driver.executeScript("arguments[0].click();", submitBtn);

    // The transaction should appear in the table below
    const table = await driver.wait(until.elementLocated(By.className('transactions-table')), 5000);
    const firstRow = await table.findElement(By.css('tbody tr td'));
    const rowText = await firstRow.getText();

    // AI parses "concert tickets" into a title. Let's just assert it appears.
    expect(rowText).to.include('Concert');
  });
});
