var KpiPage = require('./pages/manage-kpis.js');

describe('manage kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('register test kpi for geojson module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    page.clickAddKpiButton();

    browser.driver.sleep(300);

    page.typeKpiName('Geojson test kpi');

    page.typeKpiDescription('This kpi is used by geojson test module');

    page.typeKpiUnit('geo');

    page.clickSaveKpiButton();

    browser.driver.sleep(300);

    expect(page.kpis.count()).toEqual(1);

    page.clickSelectGeoJsonKpi();

    expect(page.connectedModules.count()).toEqual(1);

  });

});

