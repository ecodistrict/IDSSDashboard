var AnalyseProblemOverviewPage = require('../../src/app/01-analyse-problem/analyse-problem.page.e2e.js');

describe('analyse problem overview', function() {

  var page;

  beforeEach(function() {
    page = new AnalyseProblemOverviewPage();
  });

  it('should define the overview of the process', function() {

    browser.driver.sleep(100);
    page.inputProcessTitle('My test process');

    // page.clickEditDistrictPolygonButton();
    // browser.driver.sleep(100);

    // browser.actions().mouseMove({x: 300, y: 300}).click();
    //   browser.driver.sleep(100);

    // browser.actions().mouseMove({x: 330, y: 300}).click();
    //   browser.driver.sleep(100);

    // browser.actions().mouseMove({x: 330, y: 330}).doubleClick();
    //   browser.driver.sleep(100);


    // page.clickSaveDistrictPolygonButton();
    //   browser.driver.sleep(100);

    page.clickNextButton();


  });

});