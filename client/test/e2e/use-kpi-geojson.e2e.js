var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('use geojson module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    browser.driver.sleep(2000);

    page.clickSelectGeoJsonKpi();

    browser.driver.sleep(2000);

    expect(page.connectedModules.count()).toEqual(1);

    page.clickUseGeoJsonKpiButton();

    browser.driver.sleep(1000);

    expect(page.selectedKpis.count()).toEqual(1);

  });

});

