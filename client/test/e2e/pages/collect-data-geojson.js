var CollectDataGeoJson = function () {
  browser.get('/#/collect-data');
};

CollectDataGeoJson.prototype = Object.create({},
  {
    selectModuleInput: {
      get: function() {
        return element(by.id('collect-data-geojson-test-kpi'));
      }
    },
    clickCollectDataGeoJsonTest: {
      value: function() {
        this.selectModuleInput.click();
      }
    },
    fileInput: {
      get: function() {
        return element(by.css('input[type="file"]'));
      }
    },
    submitButton: {
      get: function() {
        return element.all(by.css('.fileupload-submit-button')).get(0);
      }
    },
    addFile: {
      value: function(name) {
        this.fileInput.sendKeys(name);
      }
    },
    clickUpload: {
      value: function() {
        this.submitButton.click();
      }
    }
  }
);

module.exports = CollectDataGeoJson;