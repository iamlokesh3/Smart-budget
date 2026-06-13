# 🚀 Quick Start Guide - Appium E2E Automation Framework

## ⏱️ 5-Minute Setup

### Step 1: Install Dependencies (2 minutes)

```bash
# Install Node modules
npm install

# Install Appium drivers
npm run setup
```

### Step 2: Configure Environment (1 minute)

```bash
# Copy example config
cp .env.example .env

# Edit .env (open in your editor)
# Set your device name: DEVICE_NAME=emulator-5554
# Or your Android package: APP_PACKAGE=com.example.smartbudget
```

### Step 3: Start Testing (2 minutes)

```bash
# Terminal 1: Start Appium server
npm run appium:start

# Terminal 2: Run tests
npm test

# Or run specific tests
npm run test:auth
npm run test:dashboard
npm run test:smoke
```

---

## 📱 Device Setup

### Option 1: Android Emulator

```bash
# List available AVDs
emulator -list-avds

# Start emulator
emulator -avd emulator-5554 -no-snapshot-load

# Verify connection
adb devices  # Should show: emulator-5554 device

# In .env set:
DEVICE_NAME=emulator-5554
```

### Option 2: Real Android Device

```bash
# Enable USB debugging on device
# Settings → Developer Options → USB Debugging

# Connect device via USB cable

# Verify connection
adb devices  # Should show: your-device-id device

# In .env set:
DEVICE_NAME=your-device-id
```

---

## 🧪 Running Your First Test

### 1. Verify Setup

```bash
# Check Appium
appium -v

# Check Android SDK
adb devices

# Check Node
node -v
npm -v
```

### 2. Start Appium

```bash
appium --log-level debug --allow-insecure chromedriver_autodownload
```

### 3. Run Smoke Tests

```bash
npm run test:smoke
```

### 4. View Report

Open `reports/mochawesome.html` in your browser

---

## 📝 Writing Your First Test

### Create Test File: `tests/my-feature.test.js`

```javascript
import { describe, it, before, afterEach } from 'mocha';
import { expect } from 'chai';
import driverFactory from '../drivers/driver.factory.js';
import BasePage from '../pages/base.page.js';
import { logger } from '../utilities/logger.js';

describe('My Feature Tests', () => {
  let driver;
  let page;

  before(async function() {
    this.timeout(60000);
    driver = driverFactory.getDriver();
    page = new BasePage(driver);
  });

  it('Should verify page element', async function() {
    this.timeout(15000);
    
    // Your test steps
    const isDisplayed = await page.isDisplayed('//*[@text="My Button"]');
    
    // Assert
    expect(isDisplayed).to.be.true;
  });
});
```

### Run Your Test

```bash
npm test -- --grep "My Feature Tests"
```

---

## 🎯 Common Tasks

### Find Element Locators

Use **Android Studio Device Explorer** or **Appium Inspector**:

```bash
# Android Studio: Tools → Device Explorer
# Inspect elements on your screen
# Copy the resource-id or content-desc

# Example locators:
// By resource-id
'//*[@resource-id="com.app:id/my_button"]'

// By text
'//*[@text="Click Me"]'

// By class
'//android.widget.Button'

// By content-desc
'//*[@content-desc="menu_button"]'
```

### Create Page Object

```javascript
// pages/my-feature.page.js
import BasePage from './base.page.js';

export class MyFeaturePage extends BasePage {
  // Locators
  myButton = '//*[@resource-id="com.app:id/my_button"]';
  myText = '//*[@resource-id="com.app:id/my_text"]';

  // Actions
  async clickButton() {
    await this.click(this.myButton);
  }

  async getText() {
    return await this.getText(this.myText);
  }

  async verifyPageLoaded() {
    return await this.isDisplayed(this.myButton);
  }
}
```

### Use Page Object in Test

```javascript
import MyFeaturePage from '../pages/my-feature.page.js';

describe('My Feature', () => {
  it('Should perform action', async () => {
    const page = new MyFeaturePage(driver);
    
    // Verify page loaded
    expect(await page.verifyPageLoaded()).to.be.true;
    
    // Perform action
    await page.clickButton();
    
    // Verify result
    const text = await page.getText();
    expect(text).to.equal('Expected Result');
  });
});
```

---

## 🔍 Debugging Tests

### Enable Debug Mode

```bash
# Run with verbose logging
npm run test:debug

# Or set env var
DEBUG=* npm test
```

### Add Logging to Tests

```javascript
import { logger } from '../utilities/logger.js';

it('Should do something', async () => {
  logger.info('Step 1: Opening app');
  // code here
  
  logger.debug('Element found at position X,Y');
  // code here
  
  logger.error('This is an error');
});
```

### Take Screenshots

```javascript
// Automatic on failure (configured)

// Manual
await page.takeScreenshot('my_debug_screenshot.png');

// Will be saved to: screenshots/my_debug_screenshot.png
```

### View Device Logs

```bash
# Real-time logs
adb logcat

# Save to file
adb logcat > device.log

# Filter logs
adb logcat | grep "com.app"
```

---

## 📊 Reports

### After Running Tests

```bash
# HTML Report
open reports/mochawesome.html

# Excel Report
open excel/Mobile_E2E_Report.xlsx

# Logs
cat logs/appium-*.log

# Screenshots
ls -la screenshots/
```

### Generate Excel Report Manually

```bash
npm run report:generate
```

---

## ⚙️ Troubleshooting Quick Fix

| Issue | Solution |
|-------|----------|
| **Port 4723 already in use** | `lsof -i :4723` then `kill -9 PID` |
| **Device not found** | `adb kill-server && adb start-server` |
| **Element not found** | Use Appium Inspector to find correct locator |
| **Test timeout** | Increase `EXPLICIT_WAIT` in `.env` |
| **App crashes** | Check device logs: `adb logcat` |
| **Permission denied** | Check `.env` paths and file permissions |

---

## 🎓 Learning Resources

### Documentation
- [Appium Docs](http://appium.io/)
- [WebdriverIO Guide](https://webdriver.io/)
- [Mocha Testing](https://mochajs.org/)
- [Chai Assertions](https://www.chaijs.com/)

### Tutorials
1. Start with `tests/smoke.test.js` - Basic tests
2. Review `pages/base.page.js` - POM pattern
3. Check `pages/login.page.js` - Real page object
4. Study `utilities/gesture.utils.js` - Gesture methods

---

## 💡 Pro Tips

### 1. Use Descriptive Test Names
```javascript
// ✅ Good
it('Should log in with valid credentials and navigate to dashboard', () => {})

// ❌ Bad
it('Should login', () => {})
```

### 2. Keep Tests Independent
```javascript
// Each test should be able to run alone
// Don't depend on previous test results
```

### 3. Use Test Data
```javascript
// ✅ Good
const testData = {
  email: 'test@example.com',
  password: 'Test@1234'
};

// ❌ Bad
const email = 'hardcoded@example.com'; // Avoid hardcoding
```

### 4. Implement Page Object Pattern
```javascript
// ✅ Good - Centralizes changes
class LoginPage extends BasePage {
  emailInput = '//*[@id="email"]';
}

// ❌ Bad - Scattered locators
const emailInput = '//*[@id="email"]'; // In test file
```

### 5. Use Proper Waits
```javascript
// ✅ Good
await page.waitForDisplayed(element, 15000);

// ❌ Bad
await driver.pause(5000); // Hard waits are unpredictable
```

---

## 🚀 Next Steps

1. ✅ **Completed**: Basic setup and first test run
2. **Next**: Create page objects for your app
3. **Then**: Write comprehensive test cases
4. **Finally**: Integrate with CI/CD pipeline

---

## 📞 Getting Help

- 📖 Read [FRAMEWORK_README.md](./FRAMEWORK_README.md) for detailed docs
- 🐛 Check [logs/](./logs/) for error details
- 💬 Review test examples in [tests/](./tests/)
- 📝 See page objects in [pages/](./pages/)

---

**Happy Testing! 🎉**

---
*Last updated: June 2024*
