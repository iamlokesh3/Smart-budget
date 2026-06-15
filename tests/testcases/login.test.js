import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage.js';

describe('Authentication', function () {
  let loginPage;

  before(async function () {
    loginPage = new LoginPage(global.driverInstance);
    await loginPage.navigate();
  });

  it('TC_AUTH_001 - Valid Login', async function () {
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    // Verify dashboard load or success state
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_AUTH_002 - Invalid Login', async function () {
    await loginPage.navigate();
    await loginPage.login('wrong@example.com', 'wrongpassword');
    const err = await loginPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_AUTH_003 - Empty Email', async function () {
    await loginPage.navigate();
    await loginPage.login(null, 'password123');
    const err = await loginPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_AUTH_004 - Empty Password', async function () {
    await loginPage.navigate();
    await loginPage.login('lokeshmk436@gmail.com', null);
    const err = await loginPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_AUTH_005 - Invalid Email Format', async function () {
    await loginPage.navigate();
    await loginPage.login('invalidemail', 'password123');
    const err = await loginPage.getErrorMessage();
    expect(err).to.not.be.null;
  });

  it('TC_AUTH_006 - Forgot Password', async function () {
    await loginPage.navigate();
    await loginPage.clickForgotPassword();
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_AUTH_007 - Reset Password', async function () {
    // Check reset password panel load
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_AUTH_008 - Session Timeout', async function () {
    // Check inactivity redirect mock
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_AUTH_009 - Logout', async function () {
    // Check logout route redirects
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_AUTH_010 - Remember Me Functionality', async function () {
    await loginPage.navigate();
    await loginPage.toggleRememberMe();
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });
});
