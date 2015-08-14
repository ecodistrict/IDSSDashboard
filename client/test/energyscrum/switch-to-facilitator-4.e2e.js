var Header = require('../../src/app/header/header.page.e2e.js');

describe('Switch to facilitator', function() {

  var page;

  beforeEach(function() {
    page = new Header();
  });

  it('should switch back to facilitator', function() {

    browser.driver.sleep(1000);
    
    page.logoutDropdown.click();
    page.switchToStakeholderLink.click();
    page.inputEmail(protractor.testEmail);
    page.inputPassword(protractor.testPassword);
    page.credentialsOkButton.click();

  	browser.driver.sleep(1000);
    expect(browser.getCurrentUrl()).toMatch('start');

  });

});