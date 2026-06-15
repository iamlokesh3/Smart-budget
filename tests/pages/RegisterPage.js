import { By, until } from 'selenium-webdriver';

export class RegisterPage {
  constructor(driver) {
    this.driver = driver;
    this.nameInput = By.xpath('//input[@placeholder="Priya Sharma"]');
    this.emailInput = By.css('input[type="email"]');
    this.passwordInput = By.css('input[type="password"]');
    this.confirmPasswordInput = By.xpath('//label[contains(text(), "Confirm")]/following-sibling::div/input');
    this.submitBtn = By.css('form button.btn-primary');
    this.errorBanner = By.xpath('//div[contains(@class, "auth-card")]//div[contains(@style, "red")] || //div[contains(text(), "exists") or contains(text(), "match")]');
  }

  async register(name, email, password, confirmPassword) {
    if (name !== null) {
      const nameEl = await this.driver.wait(until.elementLocated(this.nameInput), 5000);
      await nameEl.clear();
      await nameEl.sendKeys(name);
    }

    if (email !== null) {
      const emailEl = await this.driver.wait(until.elementLocated(this.emailInput), 5000);
      await emailEl.clear();
      await emailEl.sendKeys(email);
    }

    if (password !== null) {
      const pwEl = await this.driver.wait(until.elementLocated(this.passwordInput), 5000);
      await pwEl.clear();
      await pwEl.sendKeys(password);
    }

    if (confirmPassword !== null) {
      const cpwEl = await this.driver.wait(until.elementLocated(this.confirmPasswordInput), 5000);
      await cpwEl.clear();
      await cpwEl.sendKeys(confirmPassword);
    }

    const btn = await this.driver.wait(until.elementLocated(this.submitBtn), 5000);
    await btn.click();
  }

  async getErrorMessage() {
    const banner = await this.driver.wait(until.elementLocated(this.errorBanner), 5000);
    return await banner.getText();
  }
}
