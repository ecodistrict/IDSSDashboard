var AsIsPage = require('../../src/app/03-as-is/as-is.page.e2e.js');

describe('calculate', function() {

  var page;

  beforeEach(function() {
    page = new AsIsPage();
  });

  it('should return success', function() {

    expect(page.kpiOutputs.count()).toEqual(1);

    page.clickSetKpi('set-dashbard-test');

    browser.driver.sleep(1000);

    page.clickCalculateKpi('calculate-dashbard-test-kpi');

    browser.driver.sleep(1000);

    expect(page.resultChart().isDisplayed()).toBeTruthy();
    
  });

});

