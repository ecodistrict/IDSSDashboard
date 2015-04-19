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
    }
  }
);

module.exports = DevelopVariantsPage;