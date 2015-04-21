var DevelopVariantPage = require('../../src/app/05-develop-variants/develop-variants.page.e2e.js');

describe('develop variants', function() {

  var page;

  beforeEach(function() {
    page = new DevelopVariantPage();
  });

  it('should create variants for Rotterdam case', function() {

    page.clickCreateVariantButton();

    browser.driver.sleep(100);

    page.setVariantTitle('Alternative 1');
    page.setVariantDescription('The “Warande” park is restructured. A recreational lake is added. New plants and bushes improve the storage and drainage capacity');

    page.saveVariantButton.click();

    browser.driver.sleep(100);

    expect(page.variants.count()).toEqual(3); // as-is and to-be is hidden 2+1


  });

});

