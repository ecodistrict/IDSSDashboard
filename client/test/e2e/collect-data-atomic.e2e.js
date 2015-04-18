var CollectDataPage = require('../../src/app/02-collect-data/collect-data-atomic.page.e2e.js');
var path = require('path');

describe('insert data for atomic input', function() {

  var page;

  beforeEach(function() {
    page = new CollectDataPage();
  });

  it('should collect data for atomic input', function() {

    browser.driver.sleep(500);
    page.clickCollectDataAtomicTest();
    browser.driver.sleep(200);

    page.typeName1('Andreas');
    browser.driver.sleep(100);
    page.typeName2('Rasmus');
    browser.driver.sleep(100);
    page.typeShoeSize1(42);
    browser.driver.sleep(100);
    page.typeShoeSize2(44);
    browser.driver.sleep(100);
    page.typeShoeBrand('Nike');
    browser.driver.sleep(100);
    page.clickSelectCheeseOption();
    browser.driver.sleep(100);
    // click somewhere to unfocus
    page.name1Input.click();
    browser.driver.sleep(100);

    page.clickSaveModuleInput();
    browser.driver.sleep(500);


    browser.driver.navigate().refresh();
    browser.driver.sleep(3000);
    page.clickCollectDataAtomicTest();
    browser.driver.sleep(200);

    expect(page.name1Input.getAttribute('value')).toEqual('Andreas');
    expect(page.name2Input.getAttribute('value')).toEqual('Rasmus');
    expect(page.shoeSize1Input.getAttribute('value')).toEqual('42');
    expect(page.shoeSize2Input.getAttribute('value')).toEqual('44');
    expect(page.shoeBrandInput.getAttribute('value')).toEqual('Nike');


  });

});

