var KpiPage = require('../../src/app/01-analyse-problem/manage-kpis.page.e2e.js');

describe('manage kpis', function() {

  var page;

  beforeEach(function() {
    page = new KpiPage();
  });

  it('should register test kpis for rotterdam test case', function() {

    // KPI 1 - Quality of Life

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Quality of Life');

    page.typeKpiDescription('This KPI is qualitative for how it is to live in the district');

    page.selectQualitativeKpiOption();

    page.clickSaveKpiButton();

    // KPI 2 - Water drainage

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Water drainage');

    page.typeKpiDescription('This KPI is for water drainage capacity in m3/hour');

    page.typeKpiUnit('m3/hour');

    page.clickSaveKpiButton();

    // KPI 3 - Water storage

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Water storage');

    page.typeKpiDescription('This KPI is for water storage capacity in m3');

    page.typeKpiUnit('m3');

    page.clickSaveKpiButton();

    // KPI 4 - Water damage

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Water damage');

    page.typeKpiDescription('This KPI is for water damage in euro');

    page.typeKpiUnit('keuro/year');

    page.clickSaveKpiButton();

    // KPI 5 - Real estate value

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Real estate value');

    page.typeKpiDescription('This KPI is for real estate value in euro');

    page.typeKpiUnit('Meuro/year');

    page.clickSaveKpiButton();

    // KPI 6 - Payback period

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Payback period');

    page.typeKpiDescription('This KPI is for payback period in years');

    page.typeKpiUnit('years');

    page.clickSaveKpiButton();

    // KPI 7 - ROI

    page.clickAddKpiButton();

    browser.driver.sleep(100);

    page.typeKpiName('Return of investment');

    page.typeKpiDescription('This KPI is for return of investment ratio');

    page.typeKpiUnit('ratio');

    page.clickSaveKpiButton();

    expect(page.kpis.count()).toEqual(7);



  });

});

