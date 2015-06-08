var DevelopVariantPage = require('../../src/app/05-develop-variants/develop-variants.page.e2e.js');

describe('develop variants', function() {

  var page;

  beforeEach(function() {
    page = new DevelopVariantPage();
  });

  it('should create alternative 2 for Rotterdam case', function() {

    page.clickCreateVariantButton();

    browser.driver.sleep(200);

    page.setVariantTitle('Park renewal');
    page.setVariantDescription('The “Warande” park is restructured. A recreational lake is added. New plants and bushes improve the storage and drainage capacity');

    page.saveVariantButton.click();

    browser.driver.sleep(200);

    expect(page.variants.count()).toEqual(4); // as-is and to-be is hidden 2+1

    page.selectVariant(3);

    browser.driver.sleep(200);

    // KPI Quality of Life

    page.clickSetKpi('quality-of-life---rubroek');

    browser.driver.sleep(500);

    page.clickSetKpiValue('quality-of-life---rubroek');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(7);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-quality-of-life---rubroek-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Quality of Life

    page.clickSetKpi('quality-of-life---residents');

    browser.driver.sleep(500);

    page.clickSetKpiValue('quality-of-life---residents');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(7);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-quality-of-life---residents-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water drainage

    page.clickSetKpi('water-drainage');

    browser.driver.sleep(200);

    page.clickSetKpiValue('water-drainage');

    browser.driver.sleep(200);

    page.setKpiValueInput(20);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-water-drainage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water storage

    page.clickSetKpi('water-storage');

    browser.driver.sleep(200);

    page.clickSetKpiValue('water-storage');

    browser.driver.sleep(200);

    page.setKpiValueInput(200);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-water-storage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water damage

    page.clickSetKpi('water-damage');

    browser.driver.sleep(200);

    page.clickSetKpiValue('water-damage');

    browser.driver.sleep(200);

    page.setKpiValueInput(5);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-water-damage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Real estate value

    page.clickSetKpi('real-estate-value');

    browser.driver.sleep(200);

    page.clickSetKpiValue('real-estate-value');

    browser.driver.sleep(200);

    page.setKpiValueInput(2);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-real-estate-value-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Payback period

    page.clickSetKpi('payback-period');

    browser.driver.sleep(200);

    page.clickSetKpiValue('payback-period');

    browser.driver.sleep(200);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-payback-period-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI ROI

    page.clickSetKpi('return-on-investment');

    browser.driver.sleep(200);

    page.clickSetKpiValue('return-on-investment');

    browser.driver.sleep(200);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);
    
    page.clickBackToKpiList();

    browser.driver.sleep(200);

    expect(element(by.id('m-return-on-investment-aggregated-kpi')).isDisplayed()).toBeTruthy();

  });

});

