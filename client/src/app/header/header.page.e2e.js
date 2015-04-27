var Header = function () {};

Header.prototype = Object.create({},
  {
    logoutDropdown: {
      get: function() {
        return element(by.id('logout-dropdown'));
      }
    },
    switchToStakeholderLink: {
      get: function() {
        return element(by.id('switch-to-facilitator'));
      }
    },
    emailInput: {
      get: function() {
        return element(by.id('reenter-email'));
      }
    },
    inputEmail: {
      value: function(input) {
        this.emailInput.clear().sendKeys(input);
      }
    },
    passwordInput: {
      get: function() {
        return element(by.id('reenter-password'));
      }
    },
    inputPassword: {
      value: function(input) {
        this.passwordInput.clear().sendKeys(input);
      }
    },
    credentialsOkButton: {
      get: function() {
        return element(by.id('reenter-password-ok'));
      }
    },
  }
);

module.exports = Header;