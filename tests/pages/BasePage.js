import { By, until } from 'selenium-webdriver';

export class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async visit(url) {
    await this.driver.get(url);
  }

  async waitForElement(locator, timeout = 5000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async click(locator, timeout = 5000) {
    const el = await this.waitForElement(locator, timeout);
    await el.click();
  }

  async write(locator, text, timeout = 5000) {
    const el = await this.waitForElement(locator, timeout);
    await el.clear();
    await el.sendKeys(text);
  }

  async readText(locator, timeout = 5000) {
    const el = await this.waitForElement(locator, timeout);
    return await el.getText();
  }

  async isVisible(locator, timeout = 5000) {
    try {
      const el = await this.waitForElement(locator, timeout);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }
}
