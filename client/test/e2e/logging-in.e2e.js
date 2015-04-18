var LoginPage = require('../../src/app/login/login.page.e2e.js')

describe('login test', function() {

    var page,
        username = 'testuser@test.test',
        password = 'testing';

    beforeEach(function() {
        page = new LoginPage();
    });

    it('should enable registration when correct input', function() {

        page.typeUserName(username);
        page.typePassword(password);

        page.clickLogin();

        browser.driver.sleep(2000);

        expect(browser.getCurrentUrl()).toMatch('/start');
    });

    // it('should disable registration when incorrect input', function() {

    // TODO: implement error message

    // });

});