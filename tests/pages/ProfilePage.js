import { By, until } from 'selenium-webdriver';

export class ProfilePage {
  constructor(driver) {
    this.driver = driver;
    this.nameInput = By.xpath('//input[@value and not(@type="password") and not(@type="email")] || //input[@placeholder="Your Name"]');
    this.saveProfileBtn = By.xpath('//button[contains(text(), "Save Changes") or contains(text(), "Update Profile")]');
    this.oldPasswordInput = By.xpath('//input[@placeholder="Current Password" or @placeholder="••••••••"][1]');
    this.newPasswordInput = By.xpath('//input[@placeholder="New Password"][1]');
    this.confirmPasswordInput = By.xpath('//input[@placeholder="Confirm New Password" or contains(@placeholder, "Confirm")][1]');
    this.changePasswordBtn = By.xpath('//button[contains(text(), "Change Password") or contains(text(), "Update Password")]');
    this.avatarUploadInput = By.css('input[type="file"]');
  }

  async updateName(newName) {
    const input = await this.driver.wait(until.elementLocated(this.nameInput), 5000);
    await input.clear();
    await input.sendKeys(newName);
    const btn = await this.driver.wait(until.elementLocated(this.saveProfileBtn), 5000);
    await btn.click();
  }

  async changePassword(oldPw, newPw) {
    const oldEl = await this.driver.wait(until.elementLocated(this.oldPasswordInput), 5000);
    await oldEl.clear();
    await oldEl.sendKeys(oldPw);

    const newEl = await this.driver.wait(until.elementLocated(this.newPasswordInput), 5000);
    await newEl.clear();
    await newEl.sendKeys(newPw);

    const confEl = await this.driver.wait(until.elementLocated(this.confirmPasswordInput), 5000);
    await confEl.clear();
    await confEl.sendKeys(newPw);

    const btn = await this.driver.wait(until.elementLocated(this.changePasswordBtn), 5000);
    await btn.click();
  }

  async uploadAvatar(filePath) {
    try {
      const input = await this.driver.wait(until.elementLocated(this.avatarUploadInput), 3000);
      await input.sendKeys(filePath);
    } catch (e) {
      // Input file not found or upload button blocked
    }
  }
}
