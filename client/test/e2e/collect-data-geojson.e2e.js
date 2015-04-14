var CollectDataPage = require('./pages/collect-data-geojson.js');
var path = require('path');

describe('upload geojson file', function() {

  var page,
    fileName = './data/geojsonTest.json',
    fullPath = path.resolve(__dirname, fileName);

  beforeEach(function() {
    page = new CollectDataPage();
  });

  it('collect data for geojson input', function() {

    browser.driver.sleep(2000);
    page.clickCollectDataGeoJsonTest();
    browser.driver.sleep(2000);

    page.addFile(fullPath);
    browser.driver.sleep(2000);

    page.clickUpload();

    browser.driver.sleep(3000);

  });

});

