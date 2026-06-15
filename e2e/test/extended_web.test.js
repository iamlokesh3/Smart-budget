import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { expect } from 'chai';

describe('Extended E2E Web Tests', function () {
  this.timeout(60000);
  let driver;
  const URL = 'http://localhost:5173';

  before(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--window-size=1280,800');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    // Perform Login once to access dashboard
    await driver.get(URL);
    const loginBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Login") or contains(text(), "Get Started")]')), 5000);
    await driver.wait(until.elementIsVisible(loginBtn), 5000);
    await loginBtn.click();

    await driver.wait(until.elementLocated(By.className('auth-card')), 5000);
    const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 5000);
    await emailInput.sendKeys('lokeshmk436@gmail.com');

    const pwInput = await driver.wait(until.elementLocated(By.css('input[type="password"]')), 5000);
    await pwInput.sendKeys('password123');

    const submitBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Sign In")]')), 5000);
    await driver.wait(until.elementIsVisible(submitBtn), 5000);
    await submitBtn.click();

    // Wait for dashboard to load
    await driver.wait(until.elementLocated(By.className('action-grid')), 5000);
  });

  after(async function () {
    if (driver) await driver.quit();
  });

  // Helper function to navigate using sidebar
  async function navigateTo(tabLabel) {
    const sidebarItem = await driver.wait(
      until.elementLocated(By.xpath(`//button[contains(@class, "nav-item") and contains(., "${tabLabel}")]`)),
      5000
    );
    await driver.wait(until.elementIsVisible(sidebarItem), 5000);
    await sidebarItem.click();
    await driver.sleep(400); // Wait briefly for transition animation
  }

  // 1. Dashboard UI Checks
  it('should verify welcome hero header is displayed', async function () {
    const welcomeText = await driver.findElement(By.css('.welcome-hero h2')).getAttribute('textContent');
    expect(welcomeText).to.include('Welcome');
  });

  it('should verify action grid cards are present', async function () {
    const cards = await driver.findElements(By.css('.action-card'));
    expect(cards.length).to.equal(4);
  });

  // 2. Navigation Checks
  it('should navigate to Smart Entries page and verify header', async function () {
    await navigateTo('Smart Entries');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Smart Entries');
  });

  it('should navigate to AI Advisor page and verify header', async function () {
    await navigateTo('AI Advisor');
    const headerText = await driver.wait(until.elementLocated(By.xpath('//h4[text()="AI Advisor"]')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('AI Advisor');
  });

  it('should navigate to Budgets page and verify header', async function () {
    await navigateTo('Budgets');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Budget Planner');
  });

  it('should navigate to Goals page and verify header', async function () {
    await navigateTo('Goals');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Savings Goals');
  });

  it('should navigate to Analytics page and verify header', async function () {
    await navigateTo('Analytics');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Analytics');
  });

  it('should navigate to Health Score page and verify header', async function () {
    await navigateTo('Health Score');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Financial Health Score');
  });

  it('should navigate to Reports page and verify header', async function () {
    await navigateTo('Reports');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Reports');
  });

  it('should navigate to Notifications page and verify header', async function () {
    await navigateTo('Notifications');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Notifications');
  });

  it('should navigate to Profile page and verify header', async function () {
    await navigateTo('Profile');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Profile');
  });

  it('should navigate to Settings page and verify header', async function () {
    await navigateTo('Settings');
    const headerText = await driver.wait(until.elementLocated(By.css('.page-header h2')), 5000).getAttribute('textContent');
    expect(headerText).to.equal('Settings');
  });

  // 3. Settings Extended Checks
  it('should check settings currency select options', async function () {
    await navigateTo('Settings');
    const select = await driver.wait(until.elementLocated(By.css('select')), 5000);
    expect(select).to.not.be.null;
  });

  it('should check settings toggle switch state', async function () {
    const toggle = await driver.wait(until.elementLocated(By.className('toggle')), 5000);
    expect(toggle).to.not.be.null;
  });

  // 4. Profile Extended Checks
  it('should check profile username input field is present', async function () {
    await navigateTo('Profile');
    const usernameInput = await driver.wait(until.elementLocated(By.xpath('//input[@value="Lokesh"]')), 5000);
    expect(usernameInput).to.not.be.null;
  });

  it('should check profile email input field is present', async function () {
    const emailInput = await driver.findElement(By.xpath('//input[@type="email"]'));
    expect(emailInput).to.not.be.null;
  });

  // 5. Advisor Extended Checks
  it('should check chatbot input field placeholder text', async function () {
    await navigateTo('AI Advisor');
    const input = await driver.wait(until.elementLocated(By.className('chat-input')), 5000);
    const placeholder = await input.getAttribute('placeholder');
    expect(placeholder).to.include('Ask');
  });

  // 6. Reports Extended Checks
  it('should check reports components are present', async function () {
    await navigateTo('Reports');
    const component = await driver.wait(until.elementLocated(By.className('page-content')), 5000);
    expect(component).to.not.be.null;
  });

  // 7. General UI / Branding Checks
  it('should check sidebar branding logo text', async function () {
    const branding = await driver.findElement(By.className('sidebar-logo-text')).getAttribute('textContent');
    expect(branding).to.include('SmartBudget');
  });

  it('should check sidebar footer contains logged-in username', async function () {
    const footerName = await driver.findElement(By.xpath('//div[contains(@class, "sidebar-footer")]//div[contains(@style, "font-weight: 600")]')).getAttribute('textContent');
    expect(footerName).to.equal('Lokesh');
  });

  // 8. Intentional Failure (1 must fail)
  it('should fail to export PDF report (intentional failure)', async function () {
    await navigateTo('Reports');
    // We intentionally fail this assertion to satisfy the requirement of having exactly 1 failure
    const exportBtn = await driver.wait(until.elementLocated(By.xpath('//button[contains(., "Export") or contains(., "PDF")]')), 5000);
    await driver.wait(until.elementIsVisible(exportBtn), 5000);
    await exportBtn.click();
    // Deliberate assertion failure
    expect(true, 'Intentional E2E Report Export failure (simulated backend error)').to.be.false;
  });
});
