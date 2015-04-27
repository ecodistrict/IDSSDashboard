var ToBePage = require('../../src/app/04-to-be/to-be.page.e2e.js');

describe('set to be situation', function() {

  var page;

  beforeEach(function() {
    page = new ToBePage();
  });

  it('should be able to set to be values', function() {

    expect(page.kpiAmbitions.count()).toEqual(8);

    // do nothing for now
    
  });

});

