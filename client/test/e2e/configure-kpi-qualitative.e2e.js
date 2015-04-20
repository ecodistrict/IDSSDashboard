var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('configure atomic module', function() {

    browser.driver.sleep(300);

    page.clickUsedQualitativeKpi();

    browser.driver.sleep(300);

    expect(page.kpiTitle.get(0).getText()).toEqual('Qualitative KPI');

    // do some config here

    page.clickSaveKpiConfigButton();
    
    browser.driver.sleep(1000);

    browser.driver.navigate().refresh();

    page.clickUsedQualitativeKpi();

    // expect something to be saved here
    // expect(page.kpiScoreBad.getAttribute('value')).toEqual('1000');
    // expect(page.kpiScoreExcellent.getAttribute('value')).toEqual('1');
    // expect(page.priorityValue.getAttribute('value')).toEqual('4');

  });

});

