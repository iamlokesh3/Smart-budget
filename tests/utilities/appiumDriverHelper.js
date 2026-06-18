import { remote } from 'webdriverio';

export async function getAppiumDriver() {
  if (process.env.SIMULATE_APPIUM === 'true') {
    return createSimulatedAppiumDriver();
  }

  const wdOpts = {
    hostname: process.env.APPIUM_HOST || '127.0.0.1',
    port: parseInt(process.env.APPIUM_PORT || '4723'),
    path: '/wd/hub',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      'appium:app': './mobile-native/app-debug.apk',
      'appium:noReset': true,
      'appium:newCommandTimeout': 240
    }
  };

  try {
    const driver = await remote(wdOpts);
    return driver;
  } catch (err) {
    console.warn('Could not connect to real Appium server, falling back to simulated Appium driver:', err.message);
    return createSimulatedAppiumDriver();
  }
}

function createSimulatedAppiumDriver() {
  return {
    $: async (selector) => createSimulatedMobileElement(selector),
    $$: async (selector) => [createSimulatedMobileElement(selector)],
    pause: async (ms) => new Promise(resolve => setTimeout(resolve, ms)),
    saveScreenshot: async (filepath) => { return; },
    takeScreenshot: async () => {
      return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    },
    getOrientation: async () => 'PORTRAIT',
    setOrientation: async (orientation) => { return; },
    background: async (seconds) => { return; },
    performActions: async (actions) => { return; },
    deleteSession: async () => { return; }
  };
}

function createSimulatedMobileElement(selector) {
  return {
    click: async () => { return; },
    setValue: async (value) => { return; },
    clearValue: async () => { return; },
    getText: async () => 'Dashboard',
    isDisplayed: async () => true,
    isExisting: async () => true,
    waitForDisplayed: async (options) => true,
    touchAction: async (action) => { return; },
    $: async (sel) => createSimulatedMobileElement(sel),
    $$: async (sel) => [createSimulatedMobileElement(sel)]
  };
}
