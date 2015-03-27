var CollectDataAtomic = function () {
  browser.get('/#/collect-data/module-input/atomic-test');
};

CollectDataAtomic.prototype = Object.create({},
  {
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