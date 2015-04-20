var AsIsPage = function () {
  browser.get('/#/as-is');
};

AsIsPage.prototype = Object.create({},
  {
    kpiOutputs: {
      get: function() {
        return element.all(by.repeater('kpi in currentVariant.kpiList'));
      }
    },
    calculateAtomicTestKpiButton: {
        get: function(){
            return element(by.id('calculate-atomic-test-button'));
        }
    },
    resultChartAtomicTestKpi: {
        get: function() {
            return element(by.id('m-atomic-test-aggregated-kpi'));
        }
    },
    clickCalculateAtomicTestKpiButton: {
        value: function() {
            this.calculateAtomicTestKpiButton.click();
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
    clickSetKpiValue: {
      value: function(kpiId) {
        element(by.id('set-' + kpiId + '-button')).click();
      }
    },
    resultChart: {
      get: function(kpiId) {
        element(by.id('m-' + kpiId + '-aggregated-kpi'));
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

module.exports = AsIsPage;