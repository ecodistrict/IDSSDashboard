var ModulesPage = require('./pages/modules.js');

describe('modules are registered', function() {

  var page;

  beforeEach(function() {
    page = new ModulesPage();
  });

  it('count all modules', function() {

    expect(browser.getCurrentUrl()).toMatch('/modules');

    browser.driver.sleep(1000);

    expect(page.modules.count()).toEqual(1);

  });

});

