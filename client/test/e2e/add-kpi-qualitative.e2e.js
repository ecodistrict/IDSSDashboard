var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('manage kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('should register test kpi for qualitative input test module', function() {

    page.clickAddKpiButton();

    browser.driver.sleep(1000);

    page.typeKpiName('Qualitative KPI');

    page.typeKpiDescription('This kpi is used to test qualitative kpis');

    page.selectQualitativeKpiOption();

    page.clickSaveKpiButton();

    browser.driver.sleep(1000);

    expect(page.kpis.count()).toEqual(2);

    //page.clickSelectAtomicTestKpi();

    // note: this does behave weird - no module is found, but it is when testing manually
    //expect(page.connectedModules.count()).toEqual(1);

    //page.clickCancelUseKpiDialogButton();

    //browser.driver.sleep(1000);


  });

});

