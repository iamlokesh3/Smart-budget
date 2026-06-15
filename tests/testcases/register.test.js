import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage.js';
import { RegisterPage } from '../pages/RegisterPage.js';

describe('Registration', function () {
  let loginPage;
  let registerPage;

  before(async function () {
    loginPage = new LoginPage(global.driverInstance);
    registerPage = new RegisterPage(global.driverInstance);
    await loginPage.navigate();
    await loginPage.switchToRegister();
  });

  it('TC_REG_011 - Successful Registration', async function () {
    const randomEmail = `test_${Date.now()}@example.com`;
    await registerPage.register('New User', randomEmail, 'Password123!', 'Password123!');
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_REG_012 - Duplicate Email Registration', async function () {
    await loginPage.navigate();
    await loginPage.switchToRegister();
    await registerPage.register('Lokesh', 'lokeshmk436@gmail.com', 'Password123', 'Password123');
    const err = await registerPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_REG_013 - Password Mismatch', async function () {
    await loginPage.navigate();
    await loginPage.switchToRegister();
    await registerPage.register('Lokesh', 'pwdmismatch@example.com', 'Password123', 'Password1234');
    const err = await registerPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_REG_014 - Weak Password Validation', async function () {
    await loginPage.navigate();
    await loginPage.switchToRegister();
    await registerPage.register('Lokesh', 'weakpwd@example.com', '123', '123');
    const err = await registerPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_REG_015 - Required Field Validation', async function () {
    await loginPage.navigate();
    await loginPage.switchToRegister();
    await registerPage.register(null, 'emptyname@example.com', 'Password123', 'Password123');
    const err = await registerPage.getErrorMessage();
    expect(err).to.not.be.null;
  });
});
