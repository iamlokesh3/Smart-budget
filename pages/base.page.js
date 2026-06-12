import driverFactory from '../drivers/driver.factory.js';
import elementUtils from '../utilities/element.utils.js';
import gestureUtils from '../utilities/gesture.utils.js';
import { logger } from '../utilities/logger.js';

export default class BasePage {
  /**
   * Retrieves the active Appium driver instance
   */
  get driver() {
    return driverFactory.getDriver();
  }

  /**
   * Shared access to element utilities
   */
  get elementUtils() {
    return elementUtils;
  }

  /**
   * Shared access to gesture utilities
   */
  get gestureUtils() {
    return gestureUtils;
  }

  /**
   * Safe element finding with xpath or accessibility-id selectors
   * @param {string} selector
   */
  async findElement(selector) {
    logger.debug(`Locating element: ${selector}`);
    return await this.driver.$(selector);
  }

  /**
   * Safe list of elements finding
   * @param {string} selector
   */
  async findElements(selector) {
    logger.debug(`Locating element list: ${selector}`);
    return await this.driver.$$(selector);
  }

  /**
   * Types text into a field with auto-validation
   */
  async enterText(selector, text) {
    await this.elementUtils.setValue(selector, text);
  }

  /**
   * Click an element
   */
  async clickElement(selector) {
    await this.elementUtils.click(selector);
  }

  /**
   * Fetch elements textual value
   */
  async getElementText(selector) {
    return await this.elementUtils.getText(selector);
  }

  /**
   * Checks element visibility
   */
  async isElementVisible(selector) {
    return await this.elementUtils.isDisplayed(selector);
  }

  /**
   * Waits for elements visibility
   */
  async waitForVisible(selector, timeout = 10000) {
    return await this.elementUtils.waitForDisplayed(selector, timeout);
  }

  /**
   * Checks if a snackbar or toast message is active on screen
   * Android uses android.widget.Toast or UIA-toast layouts
   */
  async getToastMessage() {
    try {
      logger.info('Waiting for Android Toast message...');
      // standard toast class in Android UiAutomator2
      const toastSelector = '//android.widget.Toast';
      const toast = await this.waitForVisible(toastSelector, 5000);
      const text = await toast.getText();
      logger.info(`Captured toast message text: "${text}"`);
      return text;
    } catch (error) {
      logger.warn(`Could not capture Toast message: ${error.message}`);
      return null;
    }
  }

  /**
   * Smart discovery: Automatically finds all interactive form inputs on the current layout
   * Helps AI agents discover controls dynamically
   */
  async discoverFormFields() {
    logger.info('Analyzing screen for interactive elements...');
    const textFields = await this.driver.$$('//android.widget.EditText');
    const buttons = await this.driver.$$('//android.widget.Button');
    const checkboxes = await this.driver.$$('//android.widget.CheckBox');
    const radioButtons = await this.driver.$$('//android.widget.RadioButton');
    
    const results = {
      textFields: [],
      buttons: [],
      checkboxes: [],
      radioButtons: []
    };

    for (const el of textFields) {
      results.textFields.push({
        id: await el.getAttribute('resource-id'),
        text: await el.getText(),
        hint: await el.getAttribute('content-desc')
      });
    }

    for (const el of buttons) {
      results.buttons.push({
        id: await el.getAttribute('resource-id'),
        text: await el.getText(),
        desc: await el.getAttribute('content-desc')
      });
    }

    for (const el of checkboxes) {
      results.checkboxes.push({
        id: await el.getAttribute('resource-id'),
        selected: await el.getAttribute('checked') === 'true'
      });
    }

    for (const el of radioButtons) {
      results.radioButtons.push({
        id: await el.getAttribute('resource-id'),
        selected: await el.getAttribute('checked') === 'true'
      });
    }

    logger.info(`Discovered form components: ${JSON.stringify(results)}`);
    return results;
  }
}
