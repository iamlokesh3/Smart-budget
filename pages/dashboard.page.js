import BasePage from './base.page.js';

class DashboardPage extends BasePage {
  // Navigation Selectors
  get navigationDrawerOpen() { return '~open_navigation_drawer'; }
  get logoutDrawerItem() { return '~menu_logout'; }
  get profileTab() { return '~tab_profile'; }
  get formsTab() { return '~tab_forms'; }
  
  // Dashboard indicators
  get dashboardTitle() { return '//android.widget.TextView[@text="Dashboard"]'; }
  get welcomeMessage() { return 'id=com.iamlokesh.smartbudget:id/welcome_msg'; }
  get actionGrid() { return 'id=com.iamlokesh.smartbudget:id/action_grid'; }
  get financialHealthScore() { return 'id=com.iamlokesh.smartbudget:id/health_score'; }
  get profileName() { return 'id=com.iamlokesh.smartbudget:id/profile_name'; }

  /**
   * Checks if Dashboard page is loaded
   */
  async isLoaded() {
    return await this.isElementVisible(this.dashboardTitle);
  }

  /**
   * Safe logs out of the app via navigation drawer
   */
  async logout() {
    await this.clickElement(this.navigationDrawerOpen);
    await this.waitForVisible(this.logoutDrawerItem);
    await this.clickElement(this.logoutDrawerItem);
  }

  /**
   * Accesses form validation page
   */
  async navigateToForms() {
    await this.clickElement(this.formsTab);
  }

  /**
   * Accesses profile page
   */
  async navigateToProfile() {
    await this.clickElement(this.profileTab);
  }

  /**
   * Captures performance metrics - health score loading time
   */
  async getHealthScoreValue() {
    await this.waitForVisible(this.financialHealthScore);
    return await this.getElementText(this.financialHealthScore);
  }
}

export default new DashboardPage();
