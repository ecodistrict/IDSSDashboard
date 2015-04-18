var ToBePage = function () {
  browser.get('/#/to-be');
};

ToBePage.prototype = Object.create({},
  {
    ambitionInput: {
      get: function() {
        return element(by.id('kpiValue')); // note that generated ids from input spec has camelcase
      }
    },
    kpiAmbitions: {
      get: function() {
        return element.all(by.repeater('kpi in toBeVariant.kpiList'));
      }
    },
    ambitionAtomicTestKpiButton: {
        get: function(){
            return element(by.id('set-ambition-atomic-test-button'));
        }
    },
    resultChartAtomicTestKpi: {
        get: function() {
            return element(by.id('m-atomic-test-aggregated-kpi'));
        }
    },
    clickAmbitionAtomicTestKpiButton: {
        value: function() {
            this.ambitionAtomicTestKpiButton.click();
        }
    },
    setAmbitionValue: {
      value: function(input) {
        this.ambitionInput.clear().sendKeys(input);
      }
    },
    okButton: {
      get: function() {
        return element(by.id('save-kpi-config'));
      }
    },
    clickOkButton: {
      value: function() {
        this.okButton.click();
      }
    }
  }
);

module.exports = ToBePage;