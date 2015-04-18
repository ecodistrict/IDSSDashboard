var AsIsPage = require('../../src/app/03-as-is/as-is.page.e2e.js');

describe('calculate geojson input', function() {

  var page;

  beforeEach(function() {
    page = new AsIsPage();
  });

  it('should calculate geojson input', function() {

    expect(page.kpiOutputs.count()).toEqual(1);
    
  });

});

