var LoginPage = function () {
  browser.get('/#/login');
};

LoginPage.prototype = Object.create({},
  {
    userNameInput: {
      get: function() {
        return element(by.model('credentials.username'));
      }
    },
    passwordInput: {
      get: function() {
        return element(by.model('credentials.password'));
      }
    },
    submitButton: {
      get: function() {
        return element(by.id('login-button'));
      }
    },
    registerLink: {
      get: function() {
        return element(by.id('create-account'));
      }
    },
    typeUserName: {
      value: function(name) {
        this.userNameInput.sendKeys(name);
      }
    },
    typePassword: {
      value: function(email) {
        this.passwordInput.sendKeys(email);
      }
    },
    clickLogin: {
      value: function() {
        this.submitButton.click();
      }
    }
  }
);

module.exports = LoginPage;