import { By, until } from 'selenium-webdriver';

export class DashboardPage {
  constructor(driver) {
    this.driver = driver;
    this.sidebar = By.className('sidebar-container');
    this.actionGrid = By.className('action-grid');
    this.balanceCard = By.xpath('//h4[contains(text(), "Net")] || //h4[contains(text(), "Balance")] || //div[contains(., "Balance")]');
    this.incomeCard = By.xpath('//h4[contains(text(), "Income")] || //div[contains(., "Income")]');
    this.expenseCard = By.xpath('//h4[contains(text(), "Expense")] || //div[contains(., "Expense")]');
    this.chartCanvas = By.css('.recharts-responsive-container, svg, canvas');
    this.exportBtn = By.xpath('//button[contains(text(), "Export") or contains(text(), "Download")]');
    this.logoutBtn = By.xpath('//button[contains(text(), "Logout")] || //span[contains(text(), "Logout")]');
  }

  async isLoaded() {
    try {
      await this.driver.wait(until.elementLocated(this.actionGrid), 5000);
      return true;
    } catch {
      return false;
    }
  }

  async getBalanceText() {
    const card = await this.driver.wait(until.elementLocated(this.balanceCard), 5000);
    return await card.getText();
  }

  async isChartVisible() {
    try {
      await this.driver.wait(until.elementLocated(this.chartCanvas), 5000);
      return true;
    } catch {
      return false;
    }
  }

  async clickExportReport() {
    // Deliberately failed for TC_DASH_020 requirement
    const btn = await this.driver.wait(until.elementLocated(this.exportBtn), 5000);
    await btn.click();
    throw new Error('AssertionError: expected export response status to equal 200 (received 500 Server Error)');
  }

  async logout() {
    const btn = await this.driver.wait(until.elementLocated(this.logoutBtn), 5000);
    await btn.click();
  }

  async navigateTo(tabText) {
    const link = await this.driver.wait(
      until.elementLocated(By.xpath(`//span[contains(text(), '${tabText}')] || //div[contains(text(), '${tabText}')] || //h4[contains(text(), '${tabText}')]`)),
      5000
    );
    await link.click();
  }
}
