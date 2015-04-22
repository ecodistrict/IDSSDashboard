var AsIsPage = require('../../src/app/03-as-is/as-is.page.e2e.js');

describe('set kpi input', function() {

  var page;

  beforeEach(function() {
    page = new AsIsPage();
  });

  it('should set all as is values', function() {

    expect(page.kpiOutputs.count()).toEqual(7);

    // KPI Quality of Life

    page.clickSetKpiValue('quality-of-life');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-quality-of-life-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water drainage

    page.clickSetKpiValue('water-drainage');

    browser.driver.sleep(100);

    page.setKpiValueInput(2);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-water-drainage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water storage

    page.clickSetKpiValue('water-storage');

    browser.driver.sleep(100);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-water-storage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water damage

    page.clickSetKpiValue('water-damage');

    browser.driver.sleep(100);

    page.setKpiValueInput(50);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-water-damage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Real estate value

    page.clickSetKpiValue('real-estate-value');

    browser.driver.sleep(100);

    page.setKpiValueInput(15);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-real-estate-value-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Payback period

    page.clickSetKpiValue('payback-period');

    browser.driver.sleep(100);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-payback-period-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI ROI

    page.clickSetKpiValue('return-on-investment');

    browser.driver.sleep(100);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-return-on-investment-aggregated-kpi')).isDisplayed()).toBeTruthy();
    
  });

});

