var DevelopVariantPage = require('../../src/app/05-develop-variants/develop-variants.page.e2e.js');

describe('havensteder develop variants', function() {

  var page;

  beforeEach(function() {
    page = new DevelopVariantPage();
  });

  it('should adjust variants for this stakeholder', function() {


    page.selectVariant(2);

    browser.driver.sleep(200);

    // KPI Quality of Life

    page.clickSetKpiValue('quality-of-life---rubroek');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(7);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-quality-of-life---rubroek-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Quality of Life

    page.clickSetKpiValue('quality-of-life---residents');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(8);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-quality-of-life---residents-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water drainage

    page.clickSetKpiValue('water-drainage');

    browser.driver.sleep(200);

    page.setKpiValueInput(10);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-water-drainage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water storage

    page.clickSetKpiValue('water-storage');

    browser.driver.sleep(200);

    page.setKpiValueInput(100);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-water-storage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water damage

    page.clickSetKpiValue('water-damage');

    browser.driver.sleep(200);

    page.setKpiValueInput(50);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-water-damage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Real estate value

    page.clickSetKpiValue('real-estate-value');

    browser.driver.sleep(200);

    page.setKpiValueInput(0.75);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-real-estate-value-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Payback period

    page.clickDisableKpi('payback-period');
    browser.driver.sleep(200);

    // KPI ROI

    page.clickDisableKpi('return-on-investment');
    browser.driver.sleep(200);

  });

});

