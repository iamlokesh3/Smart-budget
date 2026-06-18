export class MobileBasePage {
  constructor(driver) {
    this.driver = driver;
  }

  async waitForElement(selector, timeout = 5000) {
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout });
    return el;
  }

  async tap(selector) {
    const el = await this.waitForElement(selector);
    await el.click();
  }

  async fill(selector, text) {
    const el = await this.waitForElement(selector);
    await el.setValue(text);
  }

  async swipeUp() {
    // Standard swipe gesture using Touch Actions or performActions
    try {
      await this.driver.performActions([{
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' },
        actions: [
          { type: 'pointerMove', duration: 0, x: 500, y: 800 },
          { type: 'pointerDown', button: 0 },
          { type: 'pointerMove', duration: 1000, x: 500, y: 200 },
          { type: 'pointerUp', button: 0 }
        ]
      }]);
    } catch (e) {
      // Ignore if simulated driver
    }
  }

  async longPress(selector) {
    try {
      const el = await this.waitForElement(selector);
      await el.touchAction([
        'press',
        { action: 'wait', ms: 2000 },
        'release'
      ]);
    } catch (e) {
      // Ignore if simulated
    }
  }
}
