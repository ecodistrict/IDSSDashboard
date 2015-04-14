var KpiPage = require('./pages/manage-kpis.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('configure geojson module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    browser.driver.sleep(1000);

    expect(page.selectedKpis.count()).toEqual(1);    

    page.clickUsedGeoJsonKpi();

    browser.driver.sleep(1000);

    expect(page.kpiTitle.get(0).getText()).toEqual('Geojson test kpi');

    page.typeKpiScoreExcellent(1);

    page.typeKpiScoreBad(1000);

    page.typePriorityValue(4);

    browser.driver.sleep(1000);

    //page.clickSelectGeoJsonModuleOption();

    browser.driver.sleep(1000);

    page.clickSaveKpiConfigButton();

    browser.driver.sleep(1000);


  });

});

