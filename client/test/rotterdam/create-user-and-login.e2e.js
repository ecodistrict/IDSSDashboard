var RegisterPage = require('../../src/app/register/register.page.e2e.js'),
    LoginPage = require('../../src/app/login/login.page.e2e.js');

describe('register test', function() {

    var rpage,
        lpage,
        firstName = 'test',
        lastName = 'tester',
        email = 'testuser@test.test';

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

        var returnedPassword = element(by.id('returned-password'));

        returnedPassword.getText().then(function(pass) {

            browser.get('/#/login');

            lpage.typeUserName(email);
            lpage.typePassword(pass);

            protractor.testPassword = pass;
            protractor.testEmail = email;
            console.log('Facilitator password: ' + pass);

            lpage.clickLogin();

            expect(browser.getCurrentUrl()).toMatch('/start');

        });
    
    });

});