var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('use kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('configure atomic module', function() {

    // KPI Quality of Life

    browser.driver.sleep(200);

    page.clickConfigureKpi('quality-of-life---rubroek');

    browser.driver.sleep(500);

    expect(page.kpiTitle.get(0).getText()).toEqual('Quality of Life - Rubroek');

    // stick to default for now

    page.clickSaveKpiConfigButton();

    // KPI Quality of Life

    browser.driver.sleep(200);

    page.clickConfigureKpi('quality-of-life---residents');

    browser.driver.sleep(500);

    expect(page.kpiTitle.get(0).getText()).toEqual('Quality of Life - residents');

    // stick to default for now

    page.clickSaveKpiConfigButton();

    // KPI Water drainage

    browser.driver.sleep(500);

    page.clickConfigureKpi('water-drainage');

    browser.driver.sleep(200);

    expect(page.kpiTitle.get(0).getText()).toEqual('Water drainage');

    page.typeKpiScoreExcellent(30);

    page.typeKpiScoreBad(1);

    page.clickSaveKpiConfigButton();

    // KPI Water storage

    browser.driver.sleep(200);

    page.clickConfigureKpi('water-storage');

    browser.driver.sleep(200);

    expect(page.kpiTitle.get(0).getText()).toEqual('Water storage');

    page.typeKpiScoreExcellent(250);

    page.typeKpiScoreBad(0);

    page.clickSaveKpiConfigButton();

    // KPI Water damage

    browser.driver.sleep(200);

    page.clickConfigureKpi('water-damage');

    browser.driver.sleep(200);

    expect(page.kpiTitle.get(0).getText()).toEqual('Water damage');

    page.typeKpiScoreExcellent(0);

    page.typeKpiScoreBad(200);

    page.clickSaveKpiConfigButton();

    // KPI Real estate value

    browser.driver.sleep(200);

    page.clickConfigureKpi('real-estate-value');

    browser.driver.sleep(200);

    expect(page.kpiTitle.get(0).getText()).toEqual('Real estate value');

    page.typeKpiScoreExcellent(45);

    page.typeKpiScoreBad(0);

    page.clickSaveKpiConfigButton();

    // KPI Payback period

    browser.driver.sleep(200);

    page.clickConfigureKpi('payback-period');

    browser.driver.sleep(200);

    expect(page.kpiTitle.get(0).getText()).toEqual('Payback period');

    page.typeKpiScoreExcellent(10);

    page.typeKpiScoreBad(50);

    page.clickSaveKpiConfigButton();

    // KPI Return of investment

    browser.driver.sleep(200);

    page.clickConfigureKpi('return-on-investment');

    browser.driver.sleep(200);

    expect(page.kpiTitle.get(0).getText()).toEqual('Return on investment');

    page.typeKpiScoreExcellent(1);

    page.typeKpiScoreBad(-1);

    page.clickSaveKpiConfigButton();

  });

});

