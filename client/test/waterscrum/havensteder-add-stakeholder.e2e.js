var AnalyseProblemOverviewPage = require('../../src/app/01-analyse-problem/analyse-problem.page.e2e.js');

describe('add stakeholder 1', function() {

  var page;

  beforeEach(function() {
    page = new AnalyseProblemOverviewPage();
  });

  it('should add a stakeholder and login', function() {

  	page.inputStakeholderName('Havensteder-' + protractor.testName);
  	page.addStakeholderButton.click();
  	browser.driver.sleep(200);
    expect(browser.getCurrentUrl()).toMatch('analyse-problem');

  });

});