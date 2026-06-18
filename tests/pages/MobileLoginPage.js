import { MobileBasePage } from './MobileBasePage.js';

export class MobileLoginPage extends MobileBasePage {
  constructor(driver) {
    super(driver);
    this.usernameField = '//*[@resource-id="email-input"] || //android.widget.EditText[@hint="Email"]';
    this.passwordField = '//*[@resource-id="password-input"] || //android.widget.EditText[@hint="Password"]';
    this.loginButton = '//*[@resource-id="login-btn"] || //android.widget.Button[@text="LOGIN"]';
    this.rememberMeCheckbox = '//*[@resource-id="remember-me"] || //android.widget.CheckBox';
    this.errorBanner = '//*[@resource-id="error-banner"] || //android.widget.TextView[contains(@text, "Invalid")]';
  }

  async login(username, password) {
    if (username !== null) {
      await this.fill(this.usernameField, username);
    }
    if (password !== null) {
      await this.fill(this.passwordField, password);
    }
    await this.tap(this.loginButton);
  }

  async toggleRememberMe() {
    await this.tap(this.rememberMeCheckbox);
  }

  async getErrorMessage() {
    const el = await this.waitForElement(this.errorBanner);
    return await el.getText();
  }
}
