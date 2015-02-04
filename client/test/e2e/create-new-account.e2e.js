var RegisterPage = require('./pages/register.js'),
    LoginPage = require('./pages/login.js');

describe('register test', function() {

    var rpage,
        lpage,
        firstName = 'test',
        lastName = 'tester',
        email = 'testuser@test.test',
        password = 'testing';

    beforeEach(function() {
        lpage = new LoginPage();
    });

    it('should route to register', function() {

        lpage.registerLink.click();

        expect(browser.getCurrentUrl()).toMatch('/register');

        var firstNameInput = element(by.model('registrant.firstName'));
        var lastNameInput = element(by.model('registrant.lastName'));
        var emailInput = element(by.model('registrant.email'));
        var successMessage = element(by.id('success-message'));
        var registerButton = element(by.id('register-button'));

        firstNameInput.sendKeys(firstName);
        lastNameInput.sendKeys(lastName);
        emailInput.sendKeys(email);

        registerButton.click();

        expect(successMessage.isDisplayed()).toBe(true);

    });

});