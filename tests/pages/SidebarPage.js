import { By } from 'selenium-webdriver';
import { BasePage } from './BasePage.js';

export class SidebarPage extends BasePage {
  constructor(driver) {
    super(driver);
    this.sidebarContainer = By.css('.sidebar');
  }

  async navigateTo(label) {
    // Standardize labels to match exactly what is in Sidebar or handle lowercase mapping
    const xpath = `//aside[contains(@class, 'sidebar')]//button[contains(., "${label}")]`;
    await this.click(By.xpath(xpath), 5000);
  }

  async logout() {
    await this.click(By.xpath('//aside[contains(@class, "sidebar")]//button[contains(@title, "Logout") or contains(., "Logout")]'), 5000);
  }
}
