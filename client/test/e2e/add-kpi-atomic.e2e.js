var KpiPage = require('./pages/manage-kpis.js');

describe('manage kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('should register test kpi for atomic input test module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    page.clickAddKpiButton();

    browser.driver.sleep(300);

    page.typeKpiName('Atomic test');

    page.typeKpiDescription('This kpi is used by atomic input test module');

    page.typeKpiUnit('x');

    page.clickSaveKpiButton();

    browser.driver.sleep(300);

    expect(page.kpis.count()).toEqual(1);

    page.clickSelectAtomicTestKpi();

    expect(page.connectedModules.count()).toEqual(1);

  });

});

