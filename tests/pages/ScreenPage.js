import { By, until } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';

export class ScreenPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  async verifyHeader(headerText) {
    const locator = By.xpath(`//h2[contains(., "${headerText}")] || //h1[contains(., "${headerText}")] || //div[contains(text(), "${headerText}")]`);
    return await this.isVisible(locator, 3000);
  }

  async fillInputByPlaceholder(placeholder, value) {
    const locator = By.xpath(`//input[@placeholder="${placeholder}"]`);
    await this.write(locator, value, 3000);
  }

  async clickButtonByText(btnText) {
    const locator = By.xpath(`//button[contains(., "${btnText}")]`);
    await this.click(locator, 3000);
  }

  async isChartVisible() {
    return await this.isVisible(By.css('.recharts-responsive-container, svg, canvas'), 3000);
  }

  async isTableVisible() {
    return await this.isVisible(By.css('table, .table-container, .ledger-table'), 3000);
  }

  async verifyAlertOrNotification() {
    return await this.isVisible(By.css('.alert, .notification, .toast, div[style*="color: red"], div[style*="color: green"]'), 3000);
  }
}
