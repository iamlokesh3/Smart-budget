import { By, until } from 'selenium-webdriver';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigate(url) {
    await this.driver.get(url);
  }

  async find(locator, timeout = 5000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async findVisible(locator, timeout = 5000) {
    const el = await this.find(locator, timeout);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  async click(locator) {
    const el = await this.findVisible(locator);
    await el.click();
  }

  async type(locator, text) {
    const el = await this.findVisible(locator);
    await el.clear();
    await el.sendKeys(text);
  }

  async getText(locator) {
    const el = await this.findVisible(locator);
    return await el.getText();
  }
}

export class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.nameInput = By.xpath('//input[@placeholder="Priya Sharma"]');
    this.submitBtn = By.css('form button.btn-primary');
    this.getStartedBtn = By.xpath('//button[contains(text(), "Get Started") or contains(text(), "Login")]');
    this.authCard = By.className('auth-card');
  }

  async clickGetStarted() {
    await this.click(By.xpath('//button[contains(., "Get Started") or contains(., "Login") or contains(., "back")]'));
  }

  async login(email, password) {
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    await this.click(this.submitBtn);
  }

  async switchTab(tabText) {
    await this.click(By.xpath(`//*[contains(@class, 'auth-tab') and contains(text(), '${tabText}')]`));
  }

  async register(name, email, password) {
    await this.type(this.nameInput, name);
    await this.type(this.emailInput, email);
    await this.type(this.passwordInput, password);
    // Locate the confirm password field via its parent label sibling
    await this.type(By.xpath('//label[contains(text(), "Confirm Password")]/following-sibling::div/input'), password);
    await this.click(this.submitBtn);
  }
}

export class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.actionGrid = By.className('action-grid');
    this.welcomeText = By.xpath('//h3[contains(text(), "Welcome")] || //h4[contains(text(), "Welcome")]');
  }

  async isLoaded() {
    try {
      await this.find(this.actionGrid, 5000);
      return true;
    } catch {
      return false;
    }
  }

  async navigateTo(menuText) {
    // Click sidebar or nav item
    await this.click(By.xpath(`//span[contains(text(), '${menuText}')] || //div[contains(text(), '${menuText}')] || //h4[contains(text(), '${menuText}')]`));
  }

  async logout() {
    await this.click(By.xpath('//button[contains(text(), "Logout")] || //span[contains(text(), "Logout")]'));
  }
}

export class TransactionsPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.entryInput = By.className('entry-input');
    this.submitBtn = By.className('entry-submit-btn');
    this.table = By.className('transactions-table');
  }

  async addNaturalLanguage(text) {
    await this.type(this.entryInput, text);
    await this.click(this.submitBtn);
  }

  async search(keyword) {
    await this.type(By.css('input[placeholder*="Search"]'), keyword);
  }

  async filterByCategory(category) {
    await this.click(By.xpath(`//select[contains(@class, 'filter')]/option[text()='${category}']`));
  }

  async deleteFirstTransaction() {
    await this.click(By.xpath('//table//tbody/tr[1]//button[contains(text(), "Delete")] || //table//tbody/tr[1]//span[contains(@class, "delete")]'));
  }
}
