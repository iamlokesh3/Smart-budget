import BasePage from './base.page.js';

class FormPage extends BasePage {
  // Fields Selectors
  get emailInput() { return '~form_email_input'; }
  get phoneInput() { return '~form_phone_input'; }
  get passwordComplexityInput() { return '~form_password_input'; }
  get datePickerButton() { return '~form_date_picker'; }
  get dropdownToggle() { return '~form_dropdown_toggle'; }
  get agreeCheckbox() { return '~form_agree_checkbox'; }
  get genderRadioMale() { return '~gender_male'; }
  get genderRadioFemale() { return '~gender_female'; }
  
  // Submit Button Selector
  get submitButton() { return '~form_submit_button'; }

  // Field error indicators
  get emailError() { return 'id=com.iamlokesh.smartbudget:id/email_error'; }
  get phoneError() { return 'id=com.iamlokesh.smartbudget:id/phone_error'; }
  get passwordError() { return 'id=com.iamlokesh.smartbudget:id/password_strength_error'; }
  get checkboxError() { return 'id=com.iamlokesh.smartbudget:id/checkbox_error'; }

  /**
   * Selects an item from standard Android Spinner/Dropdown dialogs
   * @param {string} optionText 
   */
  async selectDropdownOption(optionText) {
    await this.clickElement(this.dropdownToggle);
    // Find the item within the dropdown list view
    const xpathOption = `//android.widget.CheckedTextView[@text="${optionText}"]`;
    await this.clickElement(xpathOption);
  }

  /**
   * Sets date using Android standard calendar views
   * @param {string} dayText - "15" or similar
   */
  async setCalendarDay(dayText) {
    await this.clickElement(this.datePickerButton);
    const dayXpath = `//android.view.View[@text="${dayText}"]`;
    await this.clickElement(dayXpath);
    // Click OK on Android DatePickerDialog
    const okBtn = '//android.widget.Button[@text="OK" or @text="Confirm"]';
    await this.clickElement(okBtn);
  }

  /**
   * Fills form fields with test data
   */
  async fillForm(data) {
    if (data.email !== undefined) {
      await this.enterText(this.emailInput, data.email);
    }
    if (data.phone !== undefined) {
      await this.enterText(this.phoneInput, data.phone);
    }
    if (data.password !== undefined) {
      await this.enterText(this.passwordComplexityInput, data.password);
    }
    
    // Select dropdown option if present
    if (data.dropdownOption) {
      await this.selectDropdownOption(data.dropdownOption);
    }

    // Handle Checkbox
    if (data.agreeToTerms !== undefined) {
      const checkbox = await this.findElement(this.agreeCheckbox);
      const isChecked = await checkbox.getAttribute('checked') === 'true';
      if (isChecked !== data.agreeToTerms) {
        await this.clickElement(this.agreeCheckbox);
      }
    }
    
    await this.elementUtils.hideKeyboard();
  }

  /**
   * Submits the form
   */
  async submit() {
    await this.clickElement(this.submitButton);
  }

  /**
   * Fetches validation errors
   */
  async getEmailErrorText() {
    return await this.getElementText(this.emailError);
  }

  async getPhoneErrorText() {
    return await this.getElementText(this.phoneError);
  }

  async getPasswordErrorText() {
    return await this.getElementText(this.passwordError);
  }

  async getCheckboxErrorText() {
    return await this.getElementText(this.checkboxError);
  }
}

export default new FormPage();
