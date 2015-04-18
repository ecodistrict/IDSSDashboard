var CollectDataPage = require('../../src/app/02-collect-data/collect-data-geojson.page.e2e.js');
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

