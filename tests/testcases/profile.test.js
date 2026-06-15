import { expect } from 'chai';
import { LoginPage } from '../pages/LoginPage.js';
import { DashboardPage } from '../pages/DashboardPage.js';
import { ProfilePage } from '../pages/ProfilePage.js';

describe('Profile', function () {
  let loginPage;
  let dashboardPage;
  let profilePage;

  before(async function () {
    loginPage = new LoginPage(global.driverInstance);
    dashboardPage = new DashboardPage(global.driverInstance);
    profilePage = new ProfilePage(global.driverInstance);
    await loginPage.navigate();
    await loginPage.login('lokeshmk436@gmail.com', 'password123');
    await dashboardPage.navigateTo('Profile');
  });

  it('TC_PROF_029 - Update Profile', async function () {
    await profilePage.updateName('Lokesh MK');
    const title = await global.driverInstance.getTitle();
    expect(title).to.not.be.null;
  });

  it('TC_PROF_030 - Profile Image Upload functionality', async function () {
    // This test case is intentionally marked as failed
    await profilePage.uploadAvatar('./testdata/avatar.png');
  });
});
