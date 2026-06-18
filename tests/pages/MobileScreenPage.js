import { MobileBasePage } from './MobileBasePage.js';

export class MobileScreenPage extends MobileBasePage {
  constructor(driver) {
    super(driver);
  }

  async verifyHeader(headerText) {
    const selector = `//android.widget.TextView[@text="${headerText}"] || //*[contains(@text, "${headerText}")]`;
    try {
      const el = await this.waitForElement(selector, 3000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async tapButton(buttonText) {
    const selector = `//android.widget.Button[@text="${buttonText}"] || //*[contains(@text, "${buttonText}")]`;
    await this.tap(selector);
  }

  async fillInputByPlaceholder(placeholderText, value) {
    const selector = `//android.widget.EditText[@hint="${placeholderText}"] || //android.widget.EditText[@text="${placeholderText}"] || //*[@placeholder="${placeholderText}"]`;
    await this.fill(selector, value);
  }

  async isChartRendered() {
    const selector = '//*[@resource-id="chart-container"] || //android.view.View[contains(@content-desc, "chart")]';
    try {
      const el = await this.waitForElement(selector, 3000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  async verifyToastOrAlert() {
    const selector = '//android.widget.Toast || //android.widget.TextView[@resource-id="android:id/message"]';
    try {
      const el = await this.waitForElement(selector, 3000);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }
}
