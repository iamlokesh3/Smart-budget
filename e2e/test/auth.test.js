import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { expect } from 'chai';

describe('Auth Flow E2E Tests', function () {
  this.timeout(60000); // 60 seconds timeout for E2E tests
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

  it('should load the landing page', async function () {
    await driver.get(URL);
    const title = await driver.getTitle();
    expect(title).to.include('Smart Budget');

    // Look for the "Your Personal AI Financial Advisor" text
    const heading = await driver.findElement(By.css('h1')).getText();
    expect(heading).to.include('Your Personal AI');
  });

  it('should navigate to the auth page', async function () {
    // Click "Get Started" button
    const btn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Get Started")]')), 5000);
    await driver.wait(until.elementIsVisible(btn), 5000);
    await btn.click();

    // Verify auth page loaded by checking for the "Sign In" or "Create Account" elements
    await driver.wait(until.elementLocated(By.className('auth-card')), 5000);
    const authTabs = await driver.findElements(By.className('auth-tab'));
    expect(authTabs.length).to.equal(2);
  });

  it('should simulate a login attempt', async function () {
    // Fill out the email input
    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    await emailInput.sendKeys('lokeshmk436@gmail.com');

    // Fill out password
    const pwInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
    await pwInput.sendKeys('password123');

    // Submit
    const submitBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Sign In")]')), 5000);
    await driver.wait(until.elementIsVisible(submitBtn), 5000);
    await submitBtn.click();

    // Wait for dashboard to load (checking for welcome text or action grid)
    const dashboardGrid = await driver.wait(until.elementLocated(By.className('action-grid')), 5000);
    expect(dashboardGrid).to.not.be.null;
  });
});
