import { By, until } from 'selenium-webdriver';

export class LoginPage {
  constructor(driver) {
    this.driver = driver;
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.submitBtn = By.css('form button.btn-primary');
    this.rememberMeCheckbox = By.css('input[type="checkbox"]');
    this.forgotPasswordLink = By.xpath('//button[contains(text(), "Forgot")] || //a[contains(text(), "Forgot")]');
    this.registerTab = By.xpath('//button[contains(@class, "auth-tab") and contains(text(), "Register")]');
    this.loginTab = By.xpath('//button[contains(@class, "auth-tab") and contains(text(), "Login")]');
    this.errorBanner = By.xpath('//div[contains(@class, "auth-card")]//div[contains(@style, "color") or contains(@style, "red")] || //div[contains(text(), "not found") or contains(text(), "enter")]');
  }

  async navigate() {
    await this.driver.get('http://localhost:5173');
    // Click Get Started to load login card if on landing page
    try {
      const getStarted = await this.driver.wait(
        until.elementLocated(By.xpath('//button[contains(., "Get Started") or contains(., "Login")]')),
        3000
      );
      await getStarted.click();
    } catch (e) {
      // Already on auth card or no landing page button visible
    }
  }

  async login(email, password) {
    const emailEl = await this.driver.wait(until.elementLocated(this.emailInput), 5000);
    await emailEl.clear();
    if (email !== null) await emailEl.sendKeys(email);

    const pwEl = await this.driver.wait(until.elementLocated(this.passwordInput), 5000);
    await pwEl.clear();
    if (password !== null) await pwEl.sendKeys(password);

    const btn = await this.driver.wait(until.elementLocated(this.submitBtn), 5000);
    await btn.click();
  }

  async toggleRememberMe() {
    const cb = await this.driver.wait(until.elementLocated(this.rememberMeCheckbox), 5000);
    await cb.click();
  }

  async clickForgotPassword() {
    const link = await this.driver.wait(until.elementLocated(this.forgotPasswordLink), 5000);
    await link.click();
  }

  async getErrorMessage() {
    const banner = await this.driver.wait(until.elementLocated(this.errorBanner), 5000);
    return await banner.getText();
  }

  async switchToRegister() {
    const tab = await this.driver.wait(until.elementLocated(this.registerTab), 5000);
    await tab.click();
  }
}
