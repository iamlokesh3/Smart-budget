import BasePage from './base.page.js';

class LoginPage extends BasePage {
  // Elements Selectors
  get usernameInput() { return '~username_input'; } // Accessibility ID
  get passwordInput() { return '~password_input'; }
  get loginButton() { return '~login_button'; }
  
  // Validation and Error Selectors
  get usernameError() { return 'id=com.iamlokesh.smartbudget:id/username_error'; } // Resource ID fallback
  get passwordError() { return 'id=com.iamlokesh.smartbudget:id/password_error'; }
  get authErrorMessage() { return 'id=com.iamlokesh.smartbudget:id/auth_error_banner'; }
  
  // Screen Title for Verification
  get screenTitle() { return '//android.widget.TextView[@text="Sign In"]'; }

  /**
   * Checks if login page is displayed
   */
  async isLoaded() {
    return await this.isElementVisible(this.screenTitle);
  }

  /**
   * Performs login interaction
   * @param {string} username 
   * @param {string} password 
   */
  async login(username, password) {
    if (username !== undefined) {
      await this.enterText(this.usernameInput, username);
    }
    if (password !== undefined) {
      await this.enterText(this.passwordInput, password);
    }
    await this.elementUtils.hideKeyboard();
    await this.clickElement(this.loginButton);
  }

  /**
   * Retrieves username field validation error
   */
  async getUsernameErrorText() {
    return await this.getElementText(this.usernameError);
  }

  /**
   * Retrieves password field validation error
   */
  async getPasswordErrorText() {
    return await this.getElementText(this.passwordError);
  }

  /**
   * Retrieves bad credentials banner message
   */
  async getAuthErrorText() {
    return await this.getElementText(this.authErrorMessage);
  }
}

export default new LoginPage();
