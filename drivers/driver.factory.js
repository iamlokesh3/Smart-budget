import { remote } from 'webdriverio';
import { execSync } from 'child_process';
import { config } from '../config/appium.config.js';
import { logger } from '../utilities/logger.js';

class DriverFactory {
  constructor() {
    this.driver = null;
  }

  /**
   * Detects connected Android devices/emulators via ADB
   * @returns {Array<object>} List of connected devices with details
   */
  detectDevices() {
    try {
      const output = execSync('adb devices').toString();
      const lines = output.split('\n');
      const devices = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line && !line.startsWith('*') && line.includes('device')) {
          const parts = line.split(/\s+/);
          const udid = parts[0];
          
          // Get additional details like product name and model
          let model = 'Android Device';
          let release = '13'; // fallback default
          try {
            model = execSync(`adb -s ${udid} shell getprop ro.product.model`).toString().trim();
            release = execSync(`adb -s ${udid} shell getprop ro.build.version.release`).toString().trim();
          } catch (err) {
            logger.warn(`Could not fetch details for device: ${udid}. Using defaults.`);
          }

          devices.push({ udid, name: model, version: release });
        }
      }

      logger.info(`Detected devices: ${JSON.stringify(devices)}`);
      return devices;
    } catch (error) {
      logger.warn('ADB command failed or ADB is not installed. Defaulting to configured emulator/device capabilities.');
      return [];
    }
  }

  /**
   * Initializes the Appium driver using WebdriverIO
   * @returns {Promise<WebdriverIO.Browser>} The initialized driver instance
   */
  async initDriver() {
    if (this.driver) {
      return this.driver;
    }

    logger.info('Initializing Appium session...');
    const activeDevices = this.detectDevices();
    const caps = { ...config.capabilities };

    if (activeDevices.length > 0) {
      // Pick the first active device for execution
      const targetDevice = activeDevices[0];
      caps['appium:udid'] = targetDevice.udid;
      caps['appium:deviceName'] = targetDevice.name;
      caps['appium:platformVersion'] = targetDevice.version;
      logger.info(`Session bound to detected device: ${targetDevice.name} (${targetDevice.udid}) running Android ${targetDevice.version}`);
    } else {
      logger.info(`No active devices found. Using default capabilities: ${caps['appium:deviceName']} (Android ${caps['appium:platformVersion']})`);
    }

    // Determine APK launch vs. Installed package launch
    if (caps['appium:app']) {
      logger.info(`Running tests in APK Mode. Application: ${caps['appium:app']}`);
      delete caps['appium:appPackage'];
      delete caps['appium:appActivity'];
    } else {
      logger.info(`Running tests in Package Mode. Package: ${caps['appium:appPackage']}, Activity: ${caps['appium:appActivity']}`);
      delete caps['appium:app'];
    }

    const wdioOptions = {
      hostname: config.server.host,
      port: config.server.port,
      path: config.server.path,
      capabilities: caps,
      ...config.options
    };

    try {
      this.driver = await remote(wdioOptions);
      logger.info('Appium session started successfully.');
      return this.driver;
    } catch (error) {
      logger.error(`Failed to start Appium session: ${error.stack}`);
      throw error;
    }
  }

  /**
   * Retrieves the current driver instance
   * @returns {WebdriverIO.Browser}
   */
  getDriver() {
    if (!this.driver) {
      throw new Error('Driver is not initialized. Call initDriver() first.');
    }
    return this.driver;
  }

  /**
   * Terminates the active Appium session
   */
  async quitDriver() {
    if (this.driver) {
      logger.info('Closing Appium session...');
      try {
        await this.driver.deleteSession();
        logger.info('Appium session ended.');
      } catch (error) {
        logger.error(`Error during session termination: ${error.message}`);
      } finally {
        this.driver = null;
      }
    }
  }
}

export default new DriverFactory();
