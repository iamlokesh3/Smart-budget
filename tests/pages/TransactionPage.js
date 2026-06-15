import { By, until, Key } from 'selenium-webdriver';

export class TransactionPage {
  constructor(driver) {
    this.driver = driver;
    this.entryInput = By.className('entry-input');
    this.submitBtn = By.className('entry-submit-btn');
    this.table = By.className('transactions-table');
    this.searchInput = By.css('input[placeholder*="Search"]');
    this.filterSelect = By.xpath('//select[contains(@class, "filter") or contains(@class, "select")]');
    this.sortHeader = By.xpath('//th[contains(text(), "Date") or contains(text(), "Amount")]');
    this.deleteBtn = By.xpath('//table//tbody/tr[1]//button[contains(text(), "Delete")] || //table//tbody/tr[1]//span[contains(@class, "delete")]');
    this.editBtn = By.xpath('//table//tbody/tr[1]//button[contains(text(), "Edit")] || //table//tbody/tr[1]//span[contains(@class, "edit")]');
  }

  async addNaturalLanguage(text) {
    const input = await this.driver.wait(until.elementLocated(this.entryInput), 5000);
    await input.clear();
    await input.sendKeys(text);
    const btn = await this.driver.wait(until.elementLocated(this.submitBtn), 5000);
    await btn.click();
  }

  async search(keyword) {
    const search = await this.driver.wait(until.elementLocated(this.searchInput), 5000);
    await search.clear();
    await search.sendKeys(keyword);
  }

  async filterByCategory(category) {
    const select = await this.driver.wait(until.elementLocated(this.filterSelect), 5000);
    await select.click();
    const option = await this.driver.wait(until.elementLocated(By.xpath(`//option[text()='${category}' or contains(text(), '${category}')]`)), 5000);
    await option.click();
  }

  async sortByHeader() {
    const header = await this.driver.wait(until.elementLocated(this.sortHeader), 5000);
    await header.click();
  }

  async deleteFirstTransaction() {
    const btn = await this.driver.wait(until.elementLocated(this.deleteBtn), 5000);
    await btn.click();
  }

  async editFirstTransaction(newTitle) {
    const btn = await this.driver.wait(until.elementLocated(this.editBtn), 5000);
    await btn.click();
    // Locate the edit modal's title input
    const input = await this.driver.wait(until.elementLocated(By.xpath('//input[@value]')), 5000);
    await input.clear();
    await input.sendKeys(newTitle);
    const saveBtn = await this.driver.wait(until.elementLocated(By.xpath('//button[contains(text(), "Save") or contains(text(), "Update")]')), 5000);
    await saveBtn.click();
  }

  async getTableRowsCount() {
    try {
      const rows = await this.driver.findElements(By.css('table.transactions-table tbody tr'));
      return rows.length;
    } catch {
      return 0;
    }
  }
}
