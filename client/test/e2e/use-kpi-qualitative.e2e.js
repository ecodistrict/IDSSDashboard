var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('use qualitative Kpi', function() {

    browser.driver.sleep(1000);

    page.clickSelectQualitativeKpiFromList();

    browser.driver.sleep(1000);

    page.clickUseKpiButton();

    browser.driver.sleep(1000);

    expect(page.selectedKpis.count()).toEqual(2);

  });

});

