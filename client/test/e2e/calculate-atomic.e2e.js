var AsIsPage = require('../../src/app/03-as-is/as-is.page.e2e.js');

describe('calculate atomic input', function() {

  var page;

  beforeEach(function() {
    page = new AsIsPage();
  });

  it('should calculate geojson input', function() {

    expect(page.kpiOutputs.count()).toEqual(1);

    page.clickCalculateAtomicTestKpiButton();

    browser.driver.sleep(1000);

    expect(page.resultChartAtomicTestKpi.isDisplayed()).toBeTruthy();
    
  });

});

