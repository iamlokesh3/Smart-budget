import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import loginPage from '../pages/login.page.js';
import dashboardPage from '../pages/dashboard.page.js';
import formPage from '../pages/form.page.js';
import { logger } from '../utilities/logger.js';

const testData = JSON.parse(fs.readFileSync(path.resolve('testdata/userdata.json'), 'utf8'));

describe('Form Validation E2E Tests', function () {
  this.timeout(60000);

  before(async function () {
    // Authenticate first and navigate to forms module
    logger.info('Authenticating to reach form validations...');
    await loginPage.login(testData.auth.validCredentials.username, testData.auth.validCredentials.password);
    await dashboardPage.navigateToForms();
  });

  after(async function () {
    // Return to dashboard for cleanup
    await dashboardPage.driver.back();
  });

  it('TC_FORM_001 - Should validate incorrect email format', async function () {
    const data = testData.formValidations.invalidEmail;
    logger.info('Testing email format validation...');
    
    await formPage.fillForm(data);
    await formPage.submit();
    
    const errorText = await formPage.getEmailErrorText();
    expect(errorText).to.equal(data.expectedEmailError);
  });

  it('TC_FORM_002 - Should validate phone numbers constraints', async function () {
    const data = testData.formValidations.invalidPhone;
    logger.info('Testing phone digits validation...');
    
    await formPage.fillForm(data);
    await formPage.submit();
    
    const errorText = await formPage.getPhoneErrorText();
    expect(errorText).to.equal(data.expectedPhoneError);
  });

  it('TC_FORM_003 - Should validate password strength requirement checks', async function () {
    const data = testData.formValidations.weakPassword;
    logger.info('Testing password complexity validations...');
    
    await formPage.fillForm(data);
    await formPage.submit();
    
    const errorText = await formPage.getPasswordErrorText();
    expect(errorText).to.equal(data.expectedPasswordError);
  });

  it('TC_FORM_004 - Should validate mandatory checkbox selections', async function () {
    const data = testData.formValidations.uncheckedTerms;
    logger.info('Testing unchecked terms checkbox validation...');
    
    await formPage.fillForm(data);
    await formPage.submit();
    
    const errorText = await formPage.getCheckboxErrorText();
    expect(errorText).to.equal(data.expectedCheckboxError);
  });

  it('TC_FORM_005 - Should submit form successfully with valid inputs, dates, & dropdowns', async function () {
    const data = testData.formValidations.validSubmission;
    logger.info('Testing standard valid form submission...');
    
    await formPage.fillForm(data);
    
    // Test custom Android widgets
    logger.info('Testing date picker and calendar views...');
    await formPage.setCalendarDay('15');
    
    await formPage.submit();
    
    // Capture toast notification confirmation
    const toastMsg = await formPage.getToastMessage();
    expect(toastMsg).to.contain('Form Submitted Successfully');
  });
});
