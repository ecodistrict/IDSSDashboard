var ToBePage = require('../../src/app/04-to-be/to-be.page.e2e.js');

describe('calculate atomic input', function() {

  var page;

  beforeEach(function() {
    page = new ToBePage();
  });

  it('should be able to set to be values', function() {

    expect(page.kpiAmbitions.count()).toEqual(1);

    page.clickAmbitionAtomicTestKpiButton();

    browser.driver.sleep(500);

    page.setAmbitionValue(200);

    page.clickOkButton();

    browser.driver.sleep(500);

    expect(page.resultChartAtomicTestKpi.isDisplayed()).toBeTruthy();
    
  });

});

