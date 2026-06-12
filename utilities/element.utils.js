import driverFactory from '../drivers/driver.factory.js';
import { logger } from './logger.js';

class ElementUtils {
  get driver() {
    return driverFactory.getDriver();
  }

  /**
   * Explicitly waits for an element to be displayed
   * @param {string|WebdriverIO.Element} locator - Element selector or instance
   * @param {number} timeout - Wait time in ms
   */
  async waitForDisplayed(locator, timeout = 10000) {
    const el = typeof locator === 'string' ? await this.driver.$(locator) : locator;
    logger.debug(`Waiting for element to be displayed: ${el.selector || 'element'}`);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  /**
   * Explicitly waits for an element to be clickable
   * @param {string|WebdriverIO.Element} locator - Element selector or instance
   * @param {number} timeout - Wait time in ms
   */
  async waitForClickable(locator, timeout = 10000) {
    const el = typeof locator === 'string' ? await this.driver.$(locator) : locator;
    logger.debug(`Waiting for element to be clickable: ${el.selector || 'element'}`);
    await el.waitForClickable({ timeout });
    return el;
  }

  /**
   * Safe click with explicit wait
   */
  async click(locator, timeout = 10000) {
    const el = await this.waitForClickable(locator, timeout);
    logger.info(`Clicking element: ${el.selector || 'element'}`);
    await el.click();
  }

  /**
   * Safe text entry with field clearing and keyboard hiding
   */
  async setValue(locator, value, timeout = 10000) {
    const el = await this.waitForDisplayed(locator, timeout);
    logger.info(`Setting value for element ${el.selector || 'element'} to: ${value}`);
    await el.clearValue();
    await el.setValue(value);
  }

  /**
   * Safe text retrieval
   */
  async getText(locator, timeout = 10000) {
    const el = await this.waitForDisplayed(locator, timeout);
    const text = await el.getText();
    logger.debug(`Retrieved text "${text}" from ${el.selector || 'element'}`);
    return text;
  }

  /**
   * Checks if element exists and is displayed (non-blocking)
   */
  async isDisplayed(locator) {
    try {
      const el = typeof locator === 'string' ? await this.driver.$(locator) : locator;
      return await el.isDisplayed();
    } catch (err) {
      return false;
    }
  }

  /**
   * Safely dismisses keyboard if active
   */
  async hideKeyboard() {
    try {
      const isKeyboardShown = await this.driver.isKeyboardShown();
      if (isKeyboardShown) {
        logger.info('Hiding software keyboard...');
        await this.driver.hideKeyboard();
      }
    } catch (error) {
      logger.warn(`Could not hide keyboard: ${error.message}`);
    }
  }

  /**
   * Accepts system alerts
   */
  async acceptAlert() {
    try {
      if (await this.driver.isAlertOpen()) {
        const text = await this.driver.getAlertText();
        logger.info(`Accepting system alert: "${text}"`);
        await this.driver.acceptAlert();
      }
    } catch (error) {
      logger.warn(`Failed to accept system alert: ${error.message}`);
    }
  }

  /**
   * Dismisses system alerts
   */
  async dismissAlert() {
    try {
      if (await this.driver.isAlertOpen()) {
        const text = await this.driver.getAlertText();
        logger.info(`Dismissing system alert: "${text}"`);
        await this.driver.dismissAlert();
      }
    } catch (error) {
      logger.warn(`Failed to dismiss system alert: ${error.message}`);
    }
  }

  /**
   * Executes a command with retries on failure
   * @param {Function} fn - Async function to execute
   * @param {number} retries - Number of retry attempts
   * @param {number} delay - Delay between retries in ms
   */
  async retry(fn, retries = 3, delay = 2000) {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await fn();
      } catch (error) {
        attempt++;
        logger.warn(`Execution failed (Attempt ${attempt}/${retries}): ${error.message}`);
        if (attempt >= retries) throw error;
        await this.driver.pause(delay);
      }
    }
  }
}

export default new ElementUtils();
