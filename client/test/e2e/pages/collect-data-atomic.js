var CollectDataAtomic = function () {
  browser.get('/#/collect-data');
};

CollectDataAtomic.prototype = Object.create({},
  {
    selectModuleInput: {
      get: function() {
        return element(by.id('collect-data-atomic-test'));
      }
    },
    okButton: {
      get: function() {
        return element(by.id('save-module-input'));
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
        this.selectModuleInput.click();
      }
    },
    clickSaveModuleInput: {
      value: function() {
        this.okButton.click();
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
    }
  }
);

module.exports = CollectDataAtomic;