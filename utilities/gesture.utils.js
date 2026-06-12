import driverFactory from '../drivers/driver.factory.js';
import { logger } from './logger.js';

class GestureUtils {
  /**
   * Retrieves the active driver session
   */
  get driver() {
    return driverFactory.getDriver();
  }

  /**
   * Performs a single tap at a coordinate or element center
   * @param {WebdriverIO.Element|object} target - Element or coordinate object {x, y}
   */
  async tap(target) {
    let x, y;
    if (typeof target.getRect === 'function') {
      const rect = await target.getRect();
      x = Math.round(rect.x + rect.width / 2);
      y = Math.round(rect.y + rect.height / 2);
    } else {
      x = target.x;
      y = target.y;
    }

    logger.debug(`Performing single tap at: (${x}, ${y})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
  }

  /**
   * Performs a double tap at target
   * @param {WebdriverIO.Element|object} target
   */
  async doubleTap(target) {
    let x, y;
    if (typeof target.getRect === 'function') {
      const rect = await target.getRect();
      x = Math.round(rect.x + rect.width / 2);
      y = Math.round(rect.y + rect.height / 2);
    } else {
      x = target.x;
      y = target.y;
    }

    logger.debug(`Performing double tap at: (${x}, ${y})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 },
          { type: 'pause', duration: 100 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
  }

  /**
   * Performs a long press at target
   * @param {WebdriverIO.Element|object} target
   * @param {number} duration - Press duration in ms (default 1500)
   */
  async longPress(target, duration = 1500) {
    let x, y;
    if (typeof target.getRect === 'function') {
      const rect = await target.getRect();
      x = Math.round(rect.x + rect.width / 2);
      y = Math.round(rect.y + rect.height / 2);
    } else {
      x = target.x;
      y = target.y;
    }

    logger.debug(`Performing long press at: (${x}, ${y}) for ${duration}ms`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x, y },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
  }

  /**
   * Swipes from start coordinates to end coordinates
   * @param {number} startX
   * @param {number} startY
   * @param {number} endX
   * @param {number} endY
   * @param {number} duration - Swipe speed duration in ms
   */
  async swipe(startX, startY, endX, endY, duration = 800) {
    logger.debug(`Swiping from (${startX}, ${startY}) to (${endX}, ${endY}) over ${duration}ms`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration, x: endX, y: endY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
    // Pause briefly to let the physics/animation settle down
    await this.driver.pause(500);
  }

  /**
   * Helper directional swipes using screen width/height percentages
   */
  async swipeLeft() {
    const size = await this.driver.getWindowSize();
    const startX = Math.round(size.width * 0.9);
    const endX = Math.round(size.width * 0.1);
    const y = Math.round(size.height * 0.5);
    await this.swipe(startX, y, endX, y);
  }

  async swipeRight() {
    const size = await this.driver.getWindowSize();
    const startX = Math.round(size.width * 0.1);
    const endX = Math.round(size.width * 0.9);
    const y = Math.round(size.height * 0.5);
    await this.swipe(startX, y, endX, y);
  }

  async swipeUp() {
    const size = await this.driver.getWindowSize();
    const x = Math.round(size.width * 0.5);
    const startY = Math.round(size.height * 0.8);
    const endY = Math.round(size.height * 0.2);
    await this.swipe(x, startY, x, endY);
  }

  async swipeDown() {
    const size = await this.driver.getWindowSize();
    const x = Math.round(size.width * 0.5);
    const startY = Math.round(size.height * 0.2);
    const endY = Math.round(size.height * 0.8);
    await this.swipe(x, startY, x, endY);
  }

  /**
   * Drag and Drop
   * @param {WebdriverIO.Element} sourceElement
   * @param {WebdriverIO.Element} targetElement
   */
  async dragAndDrop(sourceElement, targetElement) {
    const srcRect = await sourceElement.getRect();
    const tarRect = await targetElement.getRect();
    
    const startX = Math.round(srcRect.x + srcRect.width / 2);
    const startY = Math.round(srcRect.y + srcRect.height / 2);
    const endX = Math.round(tarRect.x + tarRect.width / 2);
    const endY = Math.round(tarRect.y + tarRect.height / 2);

    logger.debug(`Dragging from (${startX}, ${startY}) to (${endX}, ${endY})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: startX, y: startY },
          { type: 'pointerDown', button: 0 },
          { type: 'pause', duration: 300 }, // drag delay
          { type: 'pointerMove', duration: 1000, x: endX, y: endY },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
  }

  /**
   * Scrolls using swipes until an element identified by selector becomes visible
   * @param {string} locator - Selector to check
   * @param {string} direction - 'up'|'down'|'left'|'right'
   * @param {number} maxScrolls - Limit iterations to prevent loops
   */
  async scrollUntilVisible(locator, direction = 'down', maxScrolls = 10) {
    logger.info(`Scrolling ${direction} looking for locator: ${locator}`);
    for (let i = 0; i < maxScrolls; i++) {
      const element = await this.driver.$(locator);
      const isExisting = await element.isExisting();
      if (isExisting && await element.isDisplayed()) {
        logger.info(`Element visible after ${i} scrolls.`);
        return element;
      }
      
      switch (direction.toLowerCase()) {
        case 'down':
          await this.swipeUp();
          break;
        case 'up':
          await this.swipeDown();
          break;
        case 'left':
          await this.swipeRight();
          break;
        case 'right':
          await this.swipeLeft();
          break;
      }
    }
    throw new Error(`Element ${locator} was not found after ${maxScrolls} scrolls`);
  }

  /**
   * Performs pinch gesture (move fingers closer together)
   * @param {WebdriverIO.Element} element - Element to pinch
   */
  async pinch(element) {
    const rect = await element.getRect();
    const centerX = Math.round(rect.x + rect.width / 2);
    const centerY = Math.round(rect.y + rect.height / 2);
    
    const offset = Math.round(Math.min(rect.width, rect.height) * 0.4);

    logger.debug(`Pinching at center (${centerX}, ${centerY})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - offset, y: centerY - offset },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 800, x: centerX - 10, y: centerY - 10 },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + offset, y: centerY + offset },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 800, x: centerX + 10, y: centerY + 10 },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
  }

  /**
   * Performs zoom gesture (move fingers further apart)
   * @param {WebdriverIO.Element} element - Element to zoom
   */
  async zoom(element) {
    const rect = await element.getRect();
    const centerX = Math.round(rect.x + rect.width / 2);
    const centerY = Math.round(rect.y + rect.height / 2);
    
    const offset = Math.round(Math.min(rect.width, rect.height) * 0.4);

    logger.debug(`Zooming in from center (${centerX}, ${centerY})`);
    await this.driver.performActions([
      {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX - 10, y: centerY - 10 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 800, x: centerX - offset, y: centerY - offset },
          { type: 'pointerUp', button: 0 }
        ]
      },
      {
        type: 'pointer',
        id: 'finger2',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: centerX + 10, y: centerY + 10 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 800, x: centerX + offset, y: centerY + offset },
          { type: 'pointerUp', button: 0 }
        ]
      }
    ]);
    await this.driver.releaseActions();
  }
}

export default new GestureUtils();
