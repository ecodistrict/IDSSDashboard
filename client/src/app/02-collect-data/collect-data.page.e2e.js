var CollectDataAtomic = function () {
  browser.get('/#/collect-data');
};

CollectDataAtomic.prototype = Object.create({},
  {
    // general page elements
    okButton: {
      get: function() {
        return element(by.id('save-module-input'));
      }
    },
    clickSaveModuleInput: {
      value: function() {
        this.okButton.click();
      }
    },
    // specific module page elements
    // ATOMIC INPUT TEST
    selectModuleInputAtomicTest: {
      get: function() {
        return element(by.id('collect-data-atomic-test'));
      }
    },
    selectCheeseOption: {
      get: function() {
        return element(by.cssContainingText('option', 'Edammer'));
      }
    },
    clickSelectCheeseOption: {
      value: function() {
        this.selectCheeseOption.click();
      }
    },
    name1Input: {
      get: function() {
        return element(by.id('name-1'));
      }
    },
    typeName1: {
      value: function(input) {
        this.name1Input.clear().sendKeys(input);
      }
    },
    name2Input: {
      get: function() {
        return element(by.id('name-2'));
      }
    },
    typeName2: {
      value: function(input) {
        this.name2Input.clear().sendKeys(input);
      }
    },
    shoeSize1Input: {
      get: function() {
        return element(by.id('shoe-size-1'));
      }
    },
    clickCollectDataAtomicTest: {
      value: function() {
        this.selectModuleInputAtomicTest.click();
      }
    },
    typeShoeSize1: {
      value: function(input) {
        this.shoeSize1Input.clear().sendKeys(input);
      }
    },
    shoeSize2Input: {
      get: function() {
        return element(by.id('shoe-size-2'));
      }
    },
    typeShoeSize2: {
      value: function(input) {
        this.shoeSize2Input.clear().sendKeys(input);
      }
    },
    shoeBrandInput: {
      get: function() {
        return element(by.id('shoe-brand'));
      }
    },
    typeShoeBrand: {
      value: function(input) {
        this.shoeBrandInput.clear().sendKeys(input);
      }
    },
    // GEOJSON INPUT
    selectModuleInputGeoJsonTest: {
      get: function() {
        return element(by.id('collect-data-geojson-test-kpi'));
      }
    },
    clickCollectDataGeoJsonTest: {
      value: function() {
        this.selectModuleInputGeoJsonTest.click();
      }
    },
    fileInput: {
      get: function() {
        return element(by.css('input[type="file"]'));
      }
    },
    submitFileButton: {
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
        this.submitFileButton.click();
      }
    }
  }
);

module.exports = CollectDataAtomic;