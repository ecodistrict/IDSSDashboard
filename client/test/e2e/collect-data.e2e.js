var CollectDataPage = require('../../src/app/03-as-is/as-is.page.e2e.js');
var path = require('path');

describe('insert data for test module', function() {

    var page,
        fileName = './data/geojsonTest.json',
        fullPath = path.resolve(__dirname, fileName);

  beforeEach(function() {
    page = new CollectDataPage();
  });

  it('should collect data for test module', function() {

    browser.driver.sleep(200);
    page.clickSetKpi('dashboard-test');
    browser.driver.sleep(200);

    // feed all test data

    // geojson
    // browser.driver.sleep(2000);
    // page.clickCollectDataGeoJsonTest();
    // browser.driver.sleep(2000);

    // page.addFile(fullPath);
    // browser.driver.sleep(2000);

    // page.clickUpload();

    // browser.driver.sleep(3000);

    // atomic inputs
    // page.typeName1('Andreas');
    // browser.driver.sleep(100);
    // page.typeName2('Rasmus');
    // browser.driver.sleep(100);
    // page.typeShoeSize1(42);
    // browser.driver.sleep(100);
    // page.typeShoeSize2(44);
    // browser.driver.sleep(100);
    // page.typeShoeBrand('Nike');
    // browser.driver.sleep(100);
    // page.clickSelectCheeseOption();
    // browser.driver.sleep(100);
    // // click somewhere to unfocus
    // page.name1Input.click();
    // browser.driver.sleep(100);

    // page.clickSaveModuleInput();
    // browser.driver.sleep(500);

    // browser.driver.navigate().refresh();
    // browser.driver.sleep(3000);
    // page.clickCollectDataAtomicTest();
    // browser.driver.sleep(200);

    // expect(page.name1Input.getAttribute('value')).toEqual('Andreas');
    // expect(page.name2Input.getAttribute('value')).toEqual('Rasmus');
    // expect(page.shoeSize1Input.getAttribute('value')).toEqual('42');
    // expect(page.shoeSize2Input.getAttribute('value')).toEqual('44');
    // expect(page.shoeBrandInput.getAttribute('value')).toEqual('Nike');

  });

});

