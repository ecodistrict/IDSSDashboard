var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('configure atomic module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    browser.driver.sleep(500);

    page.clickConfigureKpi('dashboard-test');

    browser.driver.sleep(300);

    expect(page.kpiTitle.get(0).getText()).toEqual('Dashboard Test');

    page.typeKpiScoreExcellent(1);

    page.typeKpiScoreBad(1000);

    page.clickSelectModuleOption('Dashboard Test');

    page.clickSaveKpiConfigButton();
    
    browser.driver.sleep(1000);

    browser.driver.navigate().refresh();
    page.clickConfigureKpi('dashboard-test');

    expect(page.kpiScoreBad.getAttribute('value')).toEqual('1000');
    expect(page.kpiScoreExcellent.getAttribute('value')).toEqual('1');

  });

});

