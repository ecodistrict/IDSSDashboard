var KpiPage = require('./pages/manage-kpis.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('use geojson module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    browser.driver.sleep(2000);

    page.clickSelectGeoJsonKpi();

    expect(page.connectedModules.count()).toEqual(1);

    page.clickUseGeoJsonKpiButton();

    browser.driver.sleep(1000);

    expect(page.selectedKpis.count()).toEqual(1);

  });

});

