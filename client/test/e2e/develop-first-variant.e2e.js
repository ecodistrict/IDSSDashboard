var DevelopVariantPage = require('../../src/app/05-develop-variants/develop-variants.page.e2e.js');

describe('develop variants', function() {

  var page;

  beforeEach(function() {
    page = new DevelopVariantPage();
  });

  it('should create first variant', function() {

    page.clickCreateVariantButton();

    browser.driver.sleep(100);

    page.setVariantTitle('My first variant');
    page.setVariantDescription('This is my first variant and this description text was generated in an automatic test');

    page.saveVariantButton.click();

    browser.driver.sleep(100);

    expect(page.variants.count()).toEqual(3); // as-is and to-be is hidden 2+1


  });

});

