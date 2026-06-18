import { MobileBasePage } from './MobileBasePage.js';

export class MobileSidebarPage extends MobileBasePage {
  constructor(driver) {
    super(driver);
    this.drawerToggle = '//*[@content-desc="Open navigation drawer"] || //android.widget.ImageButton';
    this.logoutItem = '//*[@resource-id="nav-logout"] || //android.widget.TextView[@text="Logout"]';
  }

  async openDrawer() {
    await this.tap(this.drawerToggle);
  }

  async navigateTo(menuItemText) {
    await this.openDrawer();
    const selector = `//android.widget.TextView[@text="${menuItemText}"] || //*[contains(@text, "${menuItemText}")]`;
    await this.tap(selector);
  }

  async logout() {
    await this.openDrawer();
    await this.tap(this.logoutItem);
  }
}
