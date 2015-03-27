var AsIsPage = require('./pages/as-is.js');

describe('calculate geojson input', function() {

  var page;

  beforeEach(function() {
    page = new AsIsPage();
  });

  it('should calculate geojson input', function() {

    expect(page.kpiOutputs.count()).toEqual(1);
    
  });

});

