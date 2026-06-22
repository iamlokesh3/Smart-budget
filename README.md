# Enterprise Appium E2E Android Automation Frameworks

This is a production-ready, enterprise-grade End-to-End (E2E) mobile test automation framework for Android applications built using **Appium 2.x**, **Node.js**, **WebdriverIO**, **Mocha**, and **Chai**.

It follows the **Page Object Model (POM)** architecture and implements robust reporting systems, failure recovery, W3C touch gestures, performance tracking, and automated CI/CD execution using GitHub Actions.

---

## Table of Contents
1. [Project Directory Structure](#project-directory-structure)
2. [Prerequisites & Environment Setup](#prerequisites--environment-setup)
3. [Configuration & Environment Variables](#configuration--environment-variables)
4. [Test Execution Commands](#test-execution-commands)
5. [Reporting & Artifacts](#reporting--artifacts)
6. [Gestures & Utility Layer](#gestures--utility-layer)
7. [Smart Testing Capabilities for AI Agents](#smart-testing-capabilities-for-ai-agents)
8. [CI/CD (GitHub Actions) Integration](#cicd-github-actions-integration)

---

## Project Directory Structure

```
project-root/
├── config/
│   └── appium.config.js      # Capabilities & server settings
├── drivers/
│   └── driver.factory.js     # WebDriver session management & ADB device lookup
├── pages/                    # Page Object Model (POM) classes
│   ├── base.page.js          # Core interactions wrapper & element helpers
│   ├── login.page.js         # Authentication page elements & workflows
│   ├── dashboard.page.js     # Main workspace navigation & tabs
│   └── form.page.js          # Input validations & custom picker widgets
├── tests/                    # Mocha Test Suites
│   ├── setup.js              # Global setup hooks & screenshot/logcat dump on failure
│   ├── auth.test.js          # Authentication scenarios
│   ├── form.test.js          # Form validations data-driven validations
│   └── ui.test.js            # Complex UI widgets & W3C touch gestures
├── utilities/
│   ├── logger.js             # Winston console and file log outputs
│   ├── gesture.utils.js      # W3C Actions touch gestures (swipe, zoom, drag)
│   ├── element.utils.js      # Wait conditions, alerts, and keyboard actions
│   └── report.generator.js   # ExcelJS multi-sheet report compiler
├── testdata/
│   └── userdata.json         # Mock database/input configuration data
├── reports/                  # Mochawesome HTML and raw JSON execution logs
│   └── failures/             # Failure captures (Screenshots and Logcat logs)
├── logs/                     # Persistent framework and app logs
├── excel/                    # Output folder for Mobile_E2E_Report.xlsx
├── .github/workflows/
│   └── appium-e2e.yml        # Automated GitHub Actions emulator workflow
├── package.json              # Dependencies and execute test scripts
└── README.md                 # Setup and run documentation
```

---

## Prerequisites & Environment Setup

Ensure you have the following system dependencies installed locally:

### 1. Node.js & JDK
- **Node.js**: v18+ or v20+
- **Java Development Kit (JDK)**: JDK 11 or 17 (Required for Android build tools and emulator operation). Ensure `JAVA_HOME` environment variable is mapped.

### 2. Android SDK Setup
- Install Android Studio and set up the Android SDK.
- Configure environment variables (add them to your system path):
  ```bash
  ANDROID_HOME=C:\Users\<username>\AppData\Local\Android\Sdk
  # Add the following to PATH:
  %ANDROID_HOME%\platform-tools
  %ANDROID_HOME%\cmdline-tools\latest\bin
  %ANDROID_HOME%\emulator
  ```
- Run `adb devices` to check that the Android debugger can successfully locate emulators or devices.

### 3. Install Appium 2.x and UiAutomator2 Driver
Install Appium globally and fetch the required Android driver:
```bash
# Install Appium 2.x
npm install -g appium@next

# Install UIAutomator2 Driver
appium driver install uiautomator2

# Verify installation
appium driver list
```

---

## Configuration & Environment Variables

Create a `.env` file in the project root to override default behaviors.

```env
# Server settings
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_PATH=/

# Target Device Configuration
DEVICE_NAME=Pixel_6
PLATFORM_VERSION=13
DEVICE_UDID=emulator-5554

# Execution Mode Options
# 1. To install and run from APK:
APK_PATH=./app/app-release.apk

# 2. To test an already-installed app:
APP_PACKAGE=com.example.app
APP_ACTIVITY=com.example.app.MainActivity

# Log Options
LOG_LEVEL=info
```

---

## Test Execution Commands

Run npm scripts to launch E2E suites:

```bash
# 1. Install dependencies
npm install

# 2. Start Appium server locally
appium

# 3. Execute all tests and generate Excel report
npm test

# 4. Execute specific suites
npm run test:auth
npm run test:form
npm run test:ui

# 5. Compile Excel Report standalone
npm run report:excel
```

---

## Reporting & Artifacts

### 1. HTML Reports (Mochawesome)
Mochawesome generates a responsive, visual HTML report showing suites, tests executed, code blocks, pass/fail status, and errors.
- **Location**: `reports/mochawesome.html`

### 2. Custom Excel Report (ExcelJS)
A professional, multi-sheet workbook `excel/Mobile_E2E_Report.xlsx` is created on every run containing:
- **Sheet 1 - Summary**: Execution times, device UDID/metadata, pass/fail percentages.
- **Sheet 2 - Test Cases**: Log of each scenario status, duration, and test suite context.
- **Sheet 3 - Failed Tests**: Failure assertions, stack trace strings, and references to failure screenshots.
- **Sheet 4 - Execution Logs**: Chronological log of steps and remarks.
- **Sheet 5 - Performance Metrics**: Timestamps, metric names (App Launch Time, Screen Load Time, API Response Delay, Crash Event), target components, values, and remarks.

### 3. Failure Captures
If a test fails, the framework automatically extracts:
- **Screenshot**: Saved under `reports/failures/<test_name>_screenshot.png`
- **Logcat Output**: App logcat buffer saved under `reports/failures/<test_name>_logcat.log`
- **Activity**: The current visible Android activity is captured.

---

## Gestures & Utility Layer

Instead of writing verbose raw actions, use pre-made wrapper APIs in `utilities/gesture.utils.js` (utilizing standard W3C coordinates-independent gestures):
- `tap(elementOrCoord)`
- `doubleTap(elementOrCoord)`
- `longPress(elementOrCoord, duration)`
- `swipe(startX, startY, endX, endY, duration)`
- `swipeLeft()`, `swipeRight()`, `swipeUp()`, `swipeDown()`
- `scrollUntilVisible(locator, direction, maxScrolls)`
- `dragAndDrop(sourceElement, targetElement)`
- `pinch(element)`, `zoom(element)`

---

## Smart Testing Capabilities for AI Agents

To accommodate future execution by AI agents, pages inherit layout introspection abilities from `BasePage`:
- **Screen Layout Analysis**: Running `discoverFormFields()` dynamically inspects the active layout tree and parses fields, buttons, toggles, checkboxes, and radio buttons. This allows AI agents to automatically analyze layouts and build validation test scripts on the fly.
- **Robust Waits**: All selectors use explicit conditional waits inside `element.utils.js`, making interactions immune to standard UI loading delays.

---

## CI/CD (GitHub Actions) Integration

Automated test execution is configured inside `.github/workflows/appium-e2e.yml`. 
Key steps:
1. Clones repo to a macOS-13 instance.
2. Installs JDK 17, Android SDK, and builds a Pixel Emulator.
3. Fires up an background Appium server.
4. Executes the full test run via `npm test`.
5. Compiles Excel logs and uploads all artifacts (reports, screenshots, device logs) to the build summary.
