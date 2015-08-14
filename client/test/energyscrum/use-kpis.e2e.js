var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('should select all kpis for use case', function() {

    browser.driver.sleep(400);

    page.clickSelectKpi('quality-of-life---rubroek');

    browser.driver.sleep(400);

    page.clickUseKpiButton();

    browser.driver.sleep(400);

    page.clickSelectKpi('quality-of-life---residents');

    browser.driver.sleep(400);

    page.clickUseKpiButton();

    browser.driver.sleep(400);

    page.clickSelectKpi('water-drainage');

    browser.driver.sleep(400);

    page.clickUseKpiButton();

    browser.driver.sleep(400);

    page.clickQuickUseKpi('water-storage');

    browser.driver.sleep(400);

    page.clickQuickUseKpi('water-damage');

    browser.driver.sleep(400);

    page.clickQuickUseKpi('real-estate-value');

    browser.driver.sleep(400);

    page.clickQuickUseKpi('payback-period');

    browser.driver.sleep(400);

    page.clickQuickUseKpi('return-on-investment');

    browser.driver.sleep(400);

    expect(page.selectedKpis.count()).toEqual(8);

  });

});

