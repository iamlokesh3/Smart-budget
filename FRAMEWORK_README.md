# Smart Budget - Enterprise Appium E2E Automation Framework

## 📱 Overview

This is a **production-ready, enterprise-grade Appium E2E automation framework** for testing Android applications. The framework is built on **Node.js, Appium 2.x, and WebdriverIO**, implementing the **Page Object Model (POM)** architecture with comprehensive testing capabilities.

### Key Features

✅ **Appium 2.x Integration** - Latest Appium with UiAutomator2 driver  
✅ **Multi-Device Support** - Real devices and Android emulators (Android 10+)  
✅ **Page Object Model (POM)** - Scalable, maintainable architecture  
✅ **Comprehensive Gesture Automation** - Tap, swipe, long press, drag-drop, pinch, zoom  
✅ **Advanced Waits & Retries** - Explicit waits, implicit waits, retry mechanisms  
✅ **Form Validation Testing** - Email, phone, password, date validation  
✅ **Screenshot & Logcat Capture** - Automatic capture on failures  
✅ **Excel Report Generation** - Multi-sheet reports with metrics  
✅ **HTML Reports** - Mochawesome integration  
✅ **Performance Monitoring** - App launch time, screen load time tracking  
✅ **CI/CD Ready** - GitHub Actions workflow included  
✅ **Comprehensive Logging** - Winston-based logging system  

---

## 🏗️ Project Structure

```
Smart-budget/
├── config/
│   └── appium.config.js          # Appium configuration & capabilities
├── drivers/
│   └── driver.factory.js         # WebDriver initialization & management
├── pages/
│   ├── base.page.js              # Base page object with common methods
│   ├── login.page.js             # Login page object
│   ├── dashboard.page.js         # Dashboard page object
│   ├── transactions.page.js      # Transactions page object
│   └── form.page.js              # Form page object
├── tests/
│   ├── setup.js                  # Test setup & hooks
│   ├── auth.test.js              # Authentication tests
│   ├── dashboard.test.js         # Dashboard tests
│   ├── transactions.test.js      # Transaction tests
│   ├── ui.test.js                # UI element tests
│   └── form.test.js              # Form validation tests
├── utilities/
│   ├── logger.js                 # Winston logger
│   ├── element.utils.js          # Element interaction utilities
│   ├── gesture.utils.js          # Gesture automation utilities
│   └── report.generator.js       # Report generation
├── excel/
│   └── report_generator.js       # Excel report generator
├── reports/                       # Test reports (Mochawesome)
├── screenshots/                   # Screenshots & logcat
├── logs/                          # Execution logs
├── testdata/                      # Test data files
├── .github/workflows/
│   └── appium-e2e.yml            # GitHub Actions workflow
├── .env                          # Environment variables
├── .env.example                  # Example environment file
├── package.json                  # Dependencies & scripts
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 14+ ([Download](https://nodejs.org/))
- **Java JDK** 11+ ([Download](https://adoptopenjdk.net/))
- **Android SDK** with API 28+ ([Setup Guide](https://developer.android.com/studio))
- **Appium 2.x** (installed via npm)
- **Android Emulator** or **Real Android Device** (Android 10+)

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/smart-budget.git
cd smart-budget
```

2. **Install Dependencies**
```bash
npm install
```

3. **Install Appium Drivers**
```bash
npm run setup
# or manually:
appium driver install uiautomator2
```

4. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with your device configuration
```

5. **Verify Setup**
```bash
appium -v
adb devices  # Should list connected devices
```

---

## ⚙️ Configuration

### Environment Variables (.env)

Create a `.env` file in the project root:

```env
# Appium Server
APPIUM_HOST=localhost
APPIUM_PORT=4723
APPIUM_TIMEOUT=60000

# Android Device Configuration
DEVICE_NAME=emulator-5554
PLATFORM_VERSION=13
AUTOMATION_NAME=UiAutomator2
PLATFORM_NAME=Android

# Application Launch (choose one)
APK_PATH=./app/app-release.apk
# OR
APP_PACKAGE=com.example.smartbudget
APP_ACTIVITY=com.example.smartbudget.MainActivity

# Logging & Reports
LOG_LEVEL=debug
SCREENSHOT_ON_FAILURE=true
CAPTURE_LOGCAT=true

# Test Data
VALID_USERNAME=testuser@example.com
VALID_PASSWORD=Test@1234

# Performance Thresholds (ms)
APP_LAUNCH_THRESHOLD=8000
SCREEN_LOAD_THRESHOLD=5000

# Retry Configuration
RETRY_COUNT=2
RETRY_DELAY=1000
IMPLICIT_WAIT=10000
EXPLICIT_WAIT=15000
```

### Appium Configuration (`config/appium.config.js`)

The configuration automatically detects connected devices and supports both APK and pre-installed app modes.

---

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm run test:auth        # Authentication tests
npm run test:dashboard   # Dashboard tests
npm run test:transactions # Transaction tests
npm run test:form        # Form validation tests
npm run test:ui          # UI element tests
npm run test:smoke       # Smoke tests
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Watch Mode (for development)
```bash
npm test -- --watch
```

---

## 📝 Test Structure

### Authentication Testing (`tests/auth.test.js`)

Tests authentication flows including:
- ✅ Valid login
- ✅ Invalid credentials
- ✅ Empty field validation
- ✅ Session persistence
- ✅ Logout functionality
- ✅ Error message validation

### Dashboard Testing (`tests/dashboard.test.js`)

Tests dashboard functionality:
- ✅ Dashboard loading
- ✅ Element visibility
- ✅ Navigation
- ✅ Data display
- ✅ User interactions

### Transaction Testing (`tests/transactions.test.js`)

Tests transaction management:
- ✅ Transaction list display
- ✅ Add transaction
- ✅ Edit transaction
- ✅ Delete transaction
- ✅ Transaction filtering

### Form Validation (`tests/form.test.js`)

Tests form validation:
- ✅ Required field validation
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Password complexity
- ✅ Date format validation
- ✅ Custom validation rules

### UI Element Testing (`tests/ui.test.js`)

Tests UI components:
- ✅ Buttons
- ✅ Text Fields
- ✅ Checkboxes
- ✅ Radio Buttons
- ✅ Dropdowns
- ✅ Toast messages
- ✅ Dialogs

---

## 🎯 Writing Tests

### Basic Test Example

```javascript
import { describe, it, before, afterEach } from 'mocha';
import { expect } from 'chai';
import driverFactory from '../drivers/driver.factory.js';
import LoginPage from '../pages/login.page.js';

describe('Authentication Tests', () => {
  let driver;
  let loginPage;

  before(async () => {
    driver = await driverFactory.initDriver();
    loginPage = new LoginPage(driver);
  });

  it('Should login with valid credentials', async () => {
    // Arrange
    const email = 'testuser@example.com';
    const password = 'Test@1234';

    // Act
    await loginPage.login(email, password);

    // Assert
    const isSuccess = await loginPage.verifySuccessMessage();
    expect(isSuccess).to.be.true;
  });
});
```

### Using Page Object Model

```javascript
// pages/my.page.js
import BasePage from './base.page.js';

export class MyPage extends BasePage {
  // Locators
  myButton = '//*[@resource-id="com.app:id/my_button"]';
  myText = '//*[@resource-id="com.app:id/my_text"]';

  // Methods
  async clickButton() {
    await this.click(this.myButton);
  }

  async getText() {
    return await this.getText(this.myText);
  }
}

// tests/my.test.js
it('Should perform action', async () => {
  const myPage = new MyPage(driver);
  await myPage.clickButton();
  const text = await myPage.getText();
  expect(text).to.equal('Expected Text');
});
```

---

## 🎨 Gesture Actions

### Supported Gestures

```javascript
const gestureUtils = require('../utilities/gesture.utils');

// Tap
await gestureUtils.tap(element);

// Double Tap
await gestureUtils.doubleTap(element);

// Long Press
await gestureUtils.longPress(element, 1500); // duration in ms

// Swipe
await gestureUtils.swipeLeft(driver);
await gestureUtils.swipeRight(driver);
await gestureUtils.swipeUp(driver);
await gestureUtils.swipeDown(driver);

// Scroll Until Visible
await gestureUtils.scrollUntilVisible(driver, locator, 'down', 10);

// Drag and Drop
await gestureUtils.dragAndDrop(sourceElement, targetElement);

// Pinch (Zoom Out)
await gestureUtils.pinch(element);

// Zoom (Zoom In)
await gestureUtils.zoom(element);

// Rotate
await gestureUtils.rotate(driver, 'LANDSCAPE');
```

---

## 📊 Reports

### Mochawesome HTML Report

Located at `reports/mochawesome.html`

Features:
- ✅ Test summary
- ✅ Pass/fail breakdown
- ✅ Test duration
- ✅ Screenshots on failure
- ✅ Video playback (if available)

### Excel Report

Located at `excel/Mobile_E2E_Report.xlsx`

**Sheet 1: Summary**
- Execution Date
- Device Info
- Test Count (Passed/Failed/Skipped)
- Pass Percentage
- Execution Duration

**Sheet 2: Test Cases**
- Test ID
- Module
- Scenario
- Status
- Start/End Time
- Duration

**Sheet 3: Failed Tests**
- Test Name
- Failure Reason
- Screenshot Path
- Device Info
- Activity Name

**Sheet 4: Execution Logs**
- Timestamp
- Test Name
- Step
- Result
- Remarks

**Sheet 5: Performance Metrics**
- Metric Name
- Component
- Value
- Remarks

### Generate Reports Manually

```bash
npm run report:generate
```

---

## 🔍 Advanced Features

### Retry Mechanism

Tests automatically retry failed steps:

```javascript
await driver.retry(async () => {
  await elementUtils.click(locator);
}, 3, 1000); // 3 retries, 1s delay
```

### Explicit Waits

```javascript
// Wait for element to be visible
await elementUtils.waitForDisplayed(locator, 15000);

// Wait for element to be clickable
await elementUtils.waitForClickable(locator, 15000);
```

### Performance Monitoring

```javascript
import { recordPerformanceMetric } from '../tests/setup.js';

recordPerformanceMetric('Screen Load Time', 'Dashboard', 2500, 'OK');
```

### Screenshot Capture

```javascript
// Automatic capture on failure (configured in setup.js)
// Manual capture
await basePage.takeScreenshot('my_screenshot.png');
```

### Device Logs

```javascript
const logs = await driverFactory.getDeviceLogs();
```

---

## 🔄 CI/CD Integration

### GitHub Actions Workflow

Located at `.github/workflows/appium-e2e.yml`

The workflow:
1. ✅ Checks out code
2. ✅ Sets up Node.js & Java
3. ✅ Installs Android SDK
4. ✅ Creates Android emulator
5. ✅ Installs Appium
6. ✅ Runs all test suites
7. ✅ Generates reports
8. ✅ Uploads artifacts

### Running Tests in CI

Tests run automatically on:
- Push to `main` or `master`
- Pull requests to `main` or `master`
- Manual trigger (workflow_dispatch)

### Accessing CI Artifacts

1. Go to GitHub Actions
2. Click on test run
3. Download artifacts (Excel report, screenshots, logs)

---

## 🐛 Troubleshooting

### Appium Connection Issues

```bash
# Check if Appium server is running
curl http://localhost:4723/status

# Start Appium with debug logs
appium --log-level debug

# Check port availability
lsof -i :4723  # macOS/Linux
netstat -ano | findstr :4723  # Windows
```

### Device Not Detected

```bash
# List connected devices
adb devices

# Check if ADB is in PATH
adb --version

# Restart ADB daemon
adb kill-server
adb start-server
```

### Element Not Found

```javascript
// Enable verbose logging
process.env.LOG_LEVEL = 'debug';

// Use inspect tools to find correct locators
// Android Studio Device File Explorer
// Appium Inspector
// UIAutomator Viewer (deprecated but still useful)
```

### Test Timeouts

- Increase `EXPLICIT_WAIT` in `.env`
- Check app performance
- Verify network connectivity
- Review device logs for crashes

---

## 📚 Best Practices

### Page Object Model
- ✅ One page class per screen
- ✅ Centralize all locators
- ✅ Keep methods simple and focused
- ✅ Reuse common methods from BasePage

### Test Writing
- ✅ Use AAA pattern (Arrange, Act, Assert)
- ✅ Clear test names
- ✅ Single responsibility per test
- ✅ Use test data management
- ✅ Avoid hard waits (use explicit waits)

### Logging
- ✅ Log important steps
- ✅ Use appropriate log levels
- ✅ Include relevant context
- ✅ Review logs after failures

### Maintenance
- ✅ Update locators when UI changes
- ✅ Maintain test data
- ✅ Review and archive old reports
- ✅ Keep dependencies updated

---

## 📖 Documentation

### Appium Documentation
- [Appium Official Docs](http://appium.io/docs/en/latest/)
- [UiAutomator2 Driver](https://github.com/appium/appium-uiautomator2-driver)

### WebdriverIO
- [WebdriverIO Documentation](https://webdriver.io/)

### Mocha & Chai
- [Mocha Test Framework](https://mochajs.org/)
- [Chai Assertion Library](https://www.chaijs.com/)

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -am 'Add new feature'`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 👥 Support & Contact

For issues, questions, or suggestions:
- 📧 Email: qa-team@example.com
- 🐛 GitHub Issues: [Create Issue](https://github.com/yourusername/smart-budget/issues)
- 💬 Slack: #qa-automation

---

## 🗺️ Roadmap

- [ ] Parallel test execution on multiple devices
- [ ] Integration with cloud testing platforms (BrowserStack, Sauce Labs)
- [ ] Advanced data-driven testing framework
- [ ] AI-powered test generation
- [ ] Cross-platform testing (iOS support)
- [ ] Performance profiling integration
- [ ] Custom reporters for specific frameworks

---

## 📝 Changelog

### Version 1.0.0
- Initial enterprise framework release
- Appium 2.x integration
- Page Object Model implementation
- Comprehensive gesture support
- Excel & HTML reporting
- GitHub Actions CI/CD
- Full documentation

---

**Last Updated**: June 2024  
**Maintained By**: QA Automation Team  
**Framework Version**: 1.0.0
