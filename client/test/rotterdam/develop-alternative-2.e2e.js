var DevelopVariantPage = require('../../src/app/05-develop-variants/develop-variants.page.e2e.js');

describe('develop variants', function() {

  var page;

  beforeEach(function() {
    page = new DevelopVariantPage();
  });

  it('should create alternative 2 for Rotterdam case', function() {

    page.clickCreateVariantButton();

    browser.driver.sleep(100);

    page.setVariantTitle('Alternative 2');
    page.setVariantDescription('The “Warande” park is restructured. A recreational lake is added. New plants and bushes improve the storage and drainage capacity');

    page.saveVariantButton.click();

    browser.driver.sleep(100);

    expect(page.variants.count()).toEqual(4); // as-is and to-be is hidden 2+1

    page.selectVariant(3);

    browser.driver.sleep(100);

    // KPI Quality of Life

    page.clickSetKpiValue('quality-of-life');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(7);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-quality-of-life-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water drainage

    page.clickSetKpiValue('water-drainage');

    browser.driver.sleep(100);

    page.setKpiValueInput(20);

    page.clickSaveKpiValue();

    browser.driver.sleep(100);

    expect(element(by.id('m-water-drainage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI Water storage

    // page.clickSetKpiValue('water-storage');

    // browser.driver.sleep(100);

    // page.setKpiValueInput(200);

    // page.clickSaveKpiValue();

    // browser.driver.sleep(100);

    // expect(element(by.id('m-water-storage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // // KPI Water damage

    // page.clickSetKpiValue('water-damage');

    // browser.driver.sleep(100);

    // page.setKpiValueInput(5);

    // page.clickSaveKpiValue();

    // browser.driver.sleep(100);

    // expect(element(by.id('m-water-damage-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // // KPI Real estate value

    // page.clickSetKpiValue('real-estate-value');

    // browser.driver.sleep(100);

    // page.setKpiValueInput(2);

    // page.clickSaveKpiValue();

    // browser.driver.sleep(100);

    // expect(element(by.id('m-real-estate-value-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // // KPI Payback period

    // page.clickSetKpiValue('payback-period');

    // browser.driver.sleep(100);

    // page.setKpiValueInput(1);

    // page.clickSaveKpiValue();

    // browser.driver.sleep(100);

    // expect(element(by.id('m-payback-period-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // // KPI ROI

    // page.clickSetKpiValue('return-of-investment');

    // browser.driver.sleep(100);

    // page.setKpiValueInput(1);

    // page.clickSaveKpiValue();

    // browser.driver.sleep(100);

    // expect(element(by.id('m-return-of-investment-aggregated-kpi')).isDisplayed()).toBeTruthy();

  });

});

