var KpiPage = require('./pages/manage-kpis.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('configure atomic module', function() {

    expect(browser.getCurrentUrl()).toMatch('analyse-problem/manage-kpis');

    browser.driver.sleep(1000);

    expect(page.selectedKpis.count()).toEqual(2);    

    page.clickUsedAtomicTestKpi();

    browser.driver.sleep(300);

    expect(page.kpiTitle.get(0).getText()).toEqual('Atomic test');

    page.typeKpiScoreExcellent(1);

    page.typeKpiScoreBad(1000);

    page.typePriorityValue(4);

    page.clickSelectAtomicTestModuleOption();

    page.clickSaveKpiConfigButton();

    // browser.driver.navigate().refresh();
    browser.driver.sleep(3000);
    // page.clickUsedAtomicTestKpi();

    // expect(page.kpiScoreBad.getAttribute('value')).toEqual('1000');
    // expect(page.kpiScoreExcellent.getAttribute('value')).toEqual('1');
    // expect(page.priorityValue.getAttribute('value')).toEqual('4');

  });

});

