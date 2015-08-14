var AnalyseProblemOverviewPage = require('../../src/app/01-analyse-problem/analyse-problem.page.e2e.js');

describe('analyse problem overview', function() {

  var page;

  beforeEach(function() {
    page = new AnalyseProblemOverviewPage();
  });

  it('should define the overview of the process', function() {

    browser.driver.sleep(100);

    // var clickMap = function (toRight, toBottom, doubleClick) { 
    //   if(doubleClick) {
    //     browser.actions().mouseMove({x: toRight, y: toBottom}).doubleClick().perform();
    //   } else {
    //     browser.actions().mouseMove({x: toRight, y: toBottom}).click().perform();
    //   }
    // };

    page.inputProcessTitle('Energy transition Rubroek');
    page.inputProcessDescription('This is a test use case for Rotterdam concerning energy transition');

    // page.clickEditDistrictPolygonButton();
    // browser.driver.sleep(2000);

    // clickMap(100, 300);
    // browser.driver.sleep(2000);

    // //browser.actions().mouseMove({x: 430, y: 400}).click();
    // clickMap(150, 300);
    // browser.driver.sleep(2000);

    // //browser.actions().mouseMove({x: 430, y: 430}).doubleClick();
    // clickMap(150, 350, true);
    // browser.driver.sleep(2000);


    // page.clickSaveDistrictPolygonButton();
    // browser.driver.sleep(100);

    page.clickNextButton();


  });

});