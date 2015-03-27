var CollectDataGeoJson = function () {
  browser.get('/#/collect-data/module-input/geojson-test-kpi');
};

CollectDataGeoJson.prototype = Object.create({},
  {
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