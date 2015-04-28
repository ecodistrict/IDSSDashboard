var DevelopVariantsPage = function () {
  browser.get('/#/develop-variants');
};

DevelopVariantsPage.prototype = Object.create({},
  {
    variants: {
      get: function() {
        return element.all(by.repeater('variant in variants'));
      }
    },
    createVariantButton: {
      get: function() {
        return element(by.id('create-variant-button'));
      }
    },
    clickCreateVariantButton: {
      value: function() {
        this.createVariantButton.click();
      } 
    },
    variantTitleInput: {
      get: function() {
        return element(by.id('variant-title'));
      }
    },
    setVariantTitle: {
      value: function(input) {
        this.variantTitleInput.clear().sendKeys(input);
      }
    },
    variantDescriptionInput: {
      get: function() {
        return element(by.id('variant-description'));
      }
    },
    setVariantDescription: {
      value: function(input) {
        this.variantDescriptionInput.clear().sendKeys(input);
      }
    },
    saveVariantButton: {
      get: function() {
        return element(by.id('save-variant-button'));
      }
    },
    selectVariant: {
      value: function(index) {
        this.variants.get(index).click();
      }
    },
    clickSetKpiValue: {
      value: function(kpiId) {
        element(by.id('set-' + kpiId + '-button')).click();
      }
    },
    clickDisableKpi: {
      value: function(kpiId) {
        element(by.id('disable-' + kpiId + '-button')).click();
      }
    },
    kpiValueInput: {
      get: function() {
        return element(by.id('kpiValue')); // camel case because of auto generated ids
      }
    },
    setKpiValueInput: {
      value: function(input) {
        this.kpiValueInput.clear().sendKeys(input);
      }
    },
    saveKpiValueButton: {
      get: function() {
        return element(by.id('save-kpi-config'));
      }
    },
    clickSaveKpiValue: {
      value: function() {
        this.saveKpiValueButton.click()
      }
    },
    selectQualitativeKpiValue: {
      value: function(referenceValue) {
        return element(by.id('radio-' + referenceValue)).click();
      }
    }
  }
);

module.exports = DevelopVariantsPage;