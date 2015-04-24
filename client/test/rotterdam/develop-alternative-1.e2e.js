var DevelopVariantPage = require('../../src/app/05-develop-variants/develop-variants.page.e2e.js');

describe('develop variants', function() {

  var page;

  beforeEach(function() {
    page = new DevelopVariantPage();
  });

  it('should create alternative 1 for Rotterdam case', function() {

    page.clickCreateVariantButton();

    browser.driver.sleep(200);

    page.setVariantTitle('Alternative 1');
    page.setVariantDescription('The “Slinger” is sold to a private investor. The “Slinger” is renewed. The “Slinger” is rented to new residents. The private investor invests in green roofs, slowed-down drainage and water-proofing the ground floor');

    page.saveVariantButton.click();

    browser.driver.sleep(200);

    expect(page.variants.count()).toEqual(3); // as-is and to-be is hidden 2+1

    page.selectVariant(2);

    browser.driver.sleep(200);

    // KPI Quality of Life

    page.clickSetKpiValue('quality-of-life');

    browser.driver.sleep(500);

    page.selectQualitativeKpiValue(7);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-quality-of-life-aggregated-kpi')).isDisplayed()).toBeTruthy();

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

    page.clickSetKpiValue('payback-period');

    browser.driver.sleep(200);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-payback-period-aggregated-kpi')).isDisplayed()).toBeTruthy();

    // KPI ROI

    page.clickSetKpiValue('return-on-investment');

    browser.driver.sleep(200);

    page.setKpiValueInput(1);

    page.clickSaveKpiValue();

    browser.driver.sleep(200);

    expect(element(by.id('m-return-on-investment-aggregated-kpi')).isDisplayed()).toBeTruthy();

  });

});

