var RegisterPage = function () {
  browser.get('/#/register');
};

RegisterPage.prototype = Object.create({},
  {
    successMessage: {
      get: function() {
        return element(by.id('success-message'));
      }
    },
    firstNameInput: {
      get: function() {
        return element(by.model('registrant.firstName'));
      }
    },
    lastNameInput: {
      get: function() {
        return element(by.model('registrant.lastName'));
      }
    },
    emailInput: {
      get: function() {
        return element(by.model('registrant.email'));
      }
    },
    submitButton: {
      get: function() {
        return element(by.id('register-button'));
      }
    },
    // getters for page validation
    successMessageIsVisible: {
      get: function() {
        return this.successMessage.isDisplayed();
      }
    },
    typeFirstName: {
      value: function(name) {
        this.firstNameInput.sendKeys(name);
      }
    },
    typeLastName: {
      value: function(name) {
        this.lastNameInput.sendKeys(name);
      }
    },
    typeEmail: {
      value: function(email) {
        this.emailInput.sendKeys(email);
      }
    },
    clickRegister: {
      value: function() {
        this.submitButton.click();
      }
    }
  }
);

module.exports = RegisterPage;