var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('configure atomic module', function() {

    // KPI Quality of Life

    browser.driver.sleep(100);

    page.clickConfigureKpi('quality-of-life');

    browser.driver.sleep(500);

    expect(page.kpiTitle.get(0).getText()).toEqual('Quality of Life');

    // stick to default for now

    page.clickSaveKpiConfigButton();

    // KPI Water drainage

    browser.driver.sleep(500);

    page.clickConfigureKpi('water-drainage');

    browser.driver.sleep(100);

    expect(page.kpiTitle.get(0).getText()).toEqual('Water drainage');

    page.typeKpiScoreExcellent(1);

    page.typeKpiScoreBad(30);

    page.clickSaveKpiConfigButton();

    // KPI Water storage

    // browser.driver.sleep(100);

    // page.clickConfigureKpi('water-storage');

    // browser.driver.sleep(100);

    // expect(page.kpiTitle.get(0).getText()).toEqual('Water storage');

    // page.typeKpiScoreExcellent(250);

    // page.typeKpiScoreBad(0);

    // page.clickSaveKpiConfigButton();

    // // KPI Water damage

    // browser.driver.sleep(100);

    // page.clickConfigureKpi('water-damage');

    // browser.driver.sleep(100);

    // expect(page.kpiTitle.get(0).getText()).toEqual('Water damage');

    // page.typeKpiScoreExcellent(250);

    // page.typeKpiScoreBad(0);

    // page.clickSaveKpiConfigButton();

    // // KPI Real estate value

    // browser.driver.sleep(100);

    // page.clickConfigureKpi('real-estate-value');

    // browser.driver.sleep(100);

    // expect(page.kpiTitle.get(0).getText()).toEqual('Real estate value');

    // page.typeKpiScoreExcellent(45);

    // page.typeKpiScoreBad(0);

    // page.clickSaveKpiConfigButton();

    // // KPI Payback period

    // browser.driver.sleep(100);

    // page.clickConfigureKpi('payback-period');

    // browser.driver.sleep(100);

    // expect(page.kpiTitle.get(0).getText()).toEqual('Payback period');

    // page.typeKpiScoreExcellent(1);

    // page.typeKpiScoreBad(100);

    // page.clickSaveKpiConfigButton();

    // // KPI Return of investment

    // browser.driver.sleep(100);

    // page.clickConfigureKpi('return-of-investment');

    // browser.driver.sleep(100);

    // expect(page.kpiTitle.get(0).getText()).toEqual('Return of investment');

    // page.typeKpiScoreExcellent(1);

    // page.typeKpiScoreBad(100);

    // page.clickSaveKpiConfigButton();

  });

});

