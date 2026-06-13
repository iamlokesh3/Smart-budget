# 🔧 Troubleshooting & Best Practices Guide

## 🚨 Common Issues & Solutions

### 1. Appium Server Connection Issues

#### Error: "Cannot GET /wd/hub/status"

**Cause**: Appium server is not running

**Solution**:
```bash
# Start Appium with proper configuration
appium --log-level debug --allow-insecure chromedriver_autodownload

# Verify it's running
curl http://localhost:4723/status

# Check if port is in use
lsof -i :4723  # macOS/Linux
netstat -ano | findstr :4723  # Windows
```

#### Error: "Port 4723 is already in use"

**Solution**:
```bash
# Kill process using port 4723
lsof -ti:4723 | xargs kill -9  # macOS/Linux

# Windows PowerShell
netstat -ano | findstr :4723
taskkill /PID <PID> /F
```

---

### 2. Device Connection Issues

#### Error: "Device not found" or "Device offline"

**Diagnosis**:
```bash
# Check connected devices
adb devices

# Expected output:
# List of attached devices
# emulator-5554          device
# your-device-id        device
```

**Solutions**:

```bash
# Kill and restart ADB daemon
adb kill-server
adb start-server

# Check device connectivity
adb shell getprop ro.build.version.release

# For USB devices
adb usb
adb reboot-bootloader

# For emulator
emulator -list-avds
emulator -avd emulator-5554 -no-snapshot-load

# Revoke USB debugging authorization and try again
adb shell pm revoke com.example.app android.permission.INTERNET
```

#### Error: "Emulator won't start"

**Solutions**:
```bash
# Check available AVD
emulator -list-avds

# Create new AVD if needed
avdmanager create avd -n test_avd -k "system-images;android-33;google_apis;x86_64" -f

# Start with verbose output
emulator -avd emulator-5554 -verbose

# Check Android Studio SDK paths
echo $ANDROID_HOME  # Should not be empty

# For macOS M1/M2 (Apple Silicon)
emulator -avd emulator-5554 -no-snapshot-load -no-window -gpu host
```

---

### 3. Element Location Issues

#### Error: "Element not found" or "Stale element reference"

**Cause**: Locator is incorrect or element changed

**Solution 1 - Find correct locator**:

```bash
# Use Android Studio Device Explorer
# Tools → Device Explorer → Browse device files

# Or use Appium Inspector
npm install -g appium-inspector
appium-inspector

# Or inspect with adb
adb shell dumpsys window windows | grep -E 'Window|focused'
```

**Solution 2 - Verify locator syntax**:

```javascript
// ✅ Correct locators:
'//*[@resource-id="com.app:id/button"]'  // By resource-id
'//*[@text="Click Me"]'                  // By text
'//android.widget.Button'                // By class
'//*[@content-desc="menu"]'              // By content-desc
'//android.view.View[@index="0"]'        // By index

// ❌ Incorrect:
'//com.app:id/button'  // Missing @resource-id=
'//*[@label="Button"]' // Android uses @text, not @label
```

**Solution 3 - Add wait before action**:

```javascript
// Wait for element to be visible
await page.waitForDisplayed(locator, 15000);

// Then interact
await page.click(locator);
```

---

### 4. Test Failures & Flakiness

#### Tests pass sometimes, fail other times (Flaky tests)

**Root Causes**:
- ❌ Hard waits (`driver.pause()`)
- ❌ Network delays
- ❌ App animations
- ❌ Device performance variations

**Solutions**:

```javascript
// ✅ Use explicit waits instead
await page.waitForDisplayed(element, 15000);

// ✅ Use retry mechanism
await page.retry(async () => {
  await page.click(element);
}, 3, 1000);

// ✅ Add appropriate delays for animations
await driver.pause(1000); // Only after animations

// ✅ Use polling for verification
let attempts = 0;
while (attempts < 5) {
  const text = await page.getText(element);
  if (text === expected) break;
  await driver.pause(500);
  attempts++;
}
```

#### Test timeout errors

**Solution**:

```bash
# Increase timeouts in .env
EXPLICIT_WAIT=20000     # Up from 15000
IMPLICIT_WAIT=15000     # Up from 10000
APPIUM_TIMEOUT=90000    # Up from 60000
```

```javascript
// Or increase in test
it('Should do something', async function() {
  this.timeout(60000);  // 60 seconds
  // test code
});
```

---

### 5. Application Launch Issues

#### Error: "App did not launch" or "App crashed on launch"

**Diagnosis**:
```bash
# Check app logs
adb logcat | grep -i "com.app"

# Check app installation
adb shell pm list packages | grep com.app

# Check app info
adb shell dumpsys package com.app
```

**Solutions**:

```bash
# Clear app data and reinstall
adb shell pm clear com.app
adb install path/to/app.apk

# Or use fullReset in .env
FULL_RESET=true

# Check for app crashes in logs
adb logcat -c  # Clear logs
adb logcat | grep -i "crash"

# Increase wait time
APPIUM_TIMEOUT=90000
```

```javascript
// In appium.config.js
'appium:appWaitDuration': 90000,
'appium:newCommandTimeout': 300,
```

---

### 6. Permission Issues

#### Error: "Permission denied" for screenshots/logs

**Solution**:
```bash
# Check file permissions
ls -la logs/
ls -la screenshots/

# Fix permissions
chmod -R 755 logs/
chmod -R 755 screenshots/
chmod -R 755 reports/

# Or run with sudo
sudo npm test
```

---

### 7. Keyboard & Input Issues

#### Error: "Soft keyboard not shown" or text input fails

**Solution**:

```javascript
// Hide keyboard before continuing
await page.hideKeyboard();

// Use setValue instead of direct typing
await page.typeText(element, 'text', true);  // true = clear first

// For special characters, use Unicode
await driver.sendKeys(['\uE003']);  // Delete key
```

---

### 8. Network & API Issues

#### Error: "Connection refused" when app connects to backend

**Solution**:

```javascript
// Verify device can reach server
adb shell ping 192.168.1.100

// Check if emulator needs special IP
# Emulator: use 10.0.2.2 instead of 127.0.0.1
# For host: 192.168.x.x or actual IP

// Mock network issues in tests
it('Should handle network error', async () => {
  // App should handle gracefully
  await page.waitForDisplayed(errorMessage);
  expect(await page.getText(errorMessage)).to.include('Network error');
});
```

---

## 📋 Performance Optimization

### Slow Test Execution

**Analysis**:
```bash
# Check test duration in logs
grep "Duration" logs/appium-*.log

# Profile slow operations
LOG_LEVEL=debug npm test 2>&1 | grep -i "slow"
```

**Optimizations**:

```javascript
// 1. Use appropriate wait times
// NOT 30000 for every wait!
const shortWait = 5000;      // For immediate elements
const normalWait = 15000;    // Default
const longWait = 30000;      // For slow operations

// 2. Parallel execution
npm test -- --parallel

// 3. Split tests across multiple devices
// Use matrix in GitHub Actions

// 4. Cache APK installation
// 'appium:noReset': false,  // Only when needed

// 5. Use native code when possible
await driver.execute('mobile: shell', {
  command: 'getprop ro.build.version.release'
});
```

---

## ✅ Best Practices

### 1. Test Organization

```
tests/
├── smoke.test.js           # Quick sanity tests
├── auth.test.js            # Authentication
├── critical-path.test.js   # Core features
├── ui.test.js              # UI elements
└── performance.test.js     # Performance tests
```

### 2. Locator Strategy

```javascript
// Priority order:
// 1. resource-id (most stable)
'//*[@resource-id="com.app:id/button"]'

// 2. content-desc
'//*[@content-desc="submit"]'

// 3. text
'//*[@text="Login"]'

// 4. class + index (least stable)
'(//android.widget.Button)[1]'
```

### 3. Test Data Management

```javascript
// ✅ Good
testData: {
  validUser: 'test@example.com',
  validPassword: 'Test@1234'
}

// In test
const user = config.testData.validUser;

// ✅ Good - From JSON file
import testUsers from '../testdata/users.json';
```

### 4. Error Handling

```javascript
// ✅ Good - Meaningful error messages
try {
  await page.waitForDisplayed(element, 5000);
} catch (error) {
  logger.error(`Failed: Element not found within 5s. Locator: ${element}`);
  throw new Error(`Authentication failed: ${error.message}`);
}

// ❌ Bad - Generic errors
catch (error) {
  throw error;
}
```

### 5. Logging Strategy

```javascript
// ✅ Good - Structured logging
logger.info('User action: Clicking login button');
logger.debug(`Element locator: ${locator}`);
logger.warn('Retry attempt 1 of 3');
logger.error(`Assertion failed: Expected true, got false`);
```

---

## 🔍 Debugging Techniques

### 1. Check Device Logs

```bash
# Real-time logcat
adb logcat

# Filter by tag
adb logcat "com.app:I"  # Info level

# Save to file
adb logcat > debug.log &
```

### 2. Inspect UI Hierarchy

```bash
# Get current UI XML
adb shell uiautomator dump /sdcard/hierarchy.xml
adb pull /sdcard/hierarchy.xml

# Or use Appium Inspector graphically
```

### 3. Check Current Activity

```javascript
const activity = await driver.getCurrentActivity();
console.log(`Current: ${activity}`);
```

### 4. Manual Test Steps

```javascript
// Add to test for debugging
if (process.env.DEBUG) {
  console.log('Current activity:', await driver.getCurrentActivity());
  console.log('Page source:', await driver.getPageSource());
  await page.takeScreenshot('debug_step.png');
  
  // Pause for manual inspection
  await driver.pause(10000);
}

// Run with: DEBUG=1 npm test
```

---

## 🆘 Getting Help

### 1. Check Logs

```bash
# Application logs
cat logs/appium-*.log | grep ERROR

# Device logs
adb logcat | grep -i "exception\|error"
```

### 2. Enable Verbose Logging

```bash
# Appium server logs
appium --log-level trace

# Test execution logs
LOG_LEVEL=trace npm test
```

### 3. Capture Full Stack Trace

```javascript
// Add to test
try {
  await page.click(element);
} catch (error) {
  logger.error(`Error: ${error.message}`);
  logger.error(`Stack: ${error.stack}`);
  throw error;
}
```

---

## 📞 Support Resources

| Resource | URL |
|----------|-----|
| Appium Issues | https://github.com/appium/appium/issues |
| WebdriverIO | https://github.com/webdriverio/webdriverio/issues |
| Mocha | https://github.com/mochajs/mocha/issues |
| Stack Overflow | Search with `[appium]` tag |

---

**Last Updated**: June 2024  
**Framework Version**: 1.0.0
