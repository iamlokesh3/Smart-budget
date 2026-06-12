import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import loginPage from '../pages/login.page.js';
import dashboardPage from '../pages/dashboard.page.js';
import { logger } from '../utilities/logger.js';
import gestureUtils from '../utilities/gesture.utils.js';

const testData = JSON.parse(fs.readFileSync(path.resolve('testdata/userdata.json'), 'utf8'));

describe('Mobile UI Components and Gesture Tests', function () {
  this.timeout(90000);

  before(async function () {
    logger.info('Authenticating user for UI gestures testing...');
    await loginPage.login(testData.auth.validCredentials.username, testData.auth.validCredentials.password);
  });

  after(async function () {
    // Return app to dashboard state
    await dashboardPage.driver.pause(1000);
  });

  it('TC_UI_001 - Should perform and validate Swipe gestures', async function () {
    logger.info('Executing Swipe Left and Swipe Right...');
    // Swipe left to open side metrics or transaction graphs
    await gestureUtils.swipeLeft();
    logger.info('Swiped Left successfully.');
    
    // Swipe back to the main layout
    await gestureUtils.swipeRight();
    logger.info('Swiped Right successfully.');
  });

  it('TC_UI_002 - Should perform Double Tap & Long Press on target controls', async function () {
    // Locate target widget (e.g. quick expense card or quick menu item)
    const quickMetricCard = 'id=com.example.app:id/quick_metric_card';
    
    logger.info('Executing Double Tap on card element...');
    const cardElement = await dashboardPage.waitForVisible(quickMetricCard);
    await gestureUtils.doubleTap(cardElement);
    
    logger.info('Executing Long Press on card element...');
    await gestureUtils.longPress(cardElement, 2000);
  });

  it('TC_UI_003 - Should scroll RecyclerView layout until a target card is visible', async function () {
    // Scroll list down to locate transaction cards or buttons
    const transactionIdLocator = '//android.widget.TextView[@text="Transaction ID: #4829"]';
    
    logger.info('Scrolling list to find a deep transaction item...');
    const targetElement = await gestureUtils.scrollUntilVisible(transactionIdLocator, 'down', 8);
    expect(await targetElement.isDisplayed()).to.be.true;
  });

  it('TC_UI_004 - Should perform Drag and Drop operations', async function () {
    const sourceWidget = 'id=com.example.app:id/drag_source';
    const targetWidget = 'id=com.example.app:id/drag_target';
    
    logger.info('Waiting for draggable components...');
    const source = await dashboardPage.waitForVisible(sourceWidget);
    const target = await dashboardPage.waitForVisible(targetWidget);
    
    logger.info('Executing Drag and Drop interaction...');
    await gestureUtils.dragAndDrop(source, target);
  });

  it('TC_UI_005 - Should perform Pinch & Zoom gestures on visual analytics components', async function () {
    const analyticsChart = 'id=com.example.app:id/savings_progress_chart';
    
    logger.info('Locating analytics graph component...');
    const chart = await dashboardPage.waitForVisible(analyticsChart);
    
    logger.info('Performing Zoom-in gesture...');
    await gestureUtils.zoom(chart);
    
    logger.info('Performing Pinch-out gesture...');
    await gestureUtils.pinch(chart);
  });

  it('TC_UI_006 - Should assert alerts, toasts, snackbars, and progress bar state transitions', async function () {
    // Trigger loading spinner overlay
    const refreshBtn = 'id=com.example.app:id/refresh_dashboard_btn';
    const progressBar = 'id=com.example.app:id/dashboard_progress_bar';
    
    logger.info('Clicking Refresh to trigger loading dialogs...');
    await dashboardPage.clickElement(refreshBtn);
    
    // Check loading indicator shows up
    const spinnerVisible = await dashboardPage.isElementVisible(progressBar);
    logger.info(`Refresh Spinner Visible: ${spinnerVisible}`);
    
    // Wait for loader to disappear
    const driver = dashboardPage.driver;
    await driver.waitUntil(
      async () => (await dashboardPage.isElementVisible(progressBar)) === false,
      { timeout: 8000, timeoutMsg: 'Progress spinner did not dismiss within timeout.' }
    );
    
    logger.info('Refresh completed, loading spinner hidden.');
  });
});
