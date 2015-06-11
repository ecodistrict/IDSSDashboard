var AsIsPage = function () {
  browser.get('/#/as-is');
};

AsIsPage.prototype = Object.create({},
  {
    kpiOutputs: {
      get: function() {
        return element.all(by.repeater('kpi in currentProcess.kpiList'));
      }
    },
    kpiValueInput: {
      get: function() {
        return element(by.id('quantitative-input'));
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
    clickSetKpi: {
      value: function(kpiId) {
        element(by.id('set-' + kpiId)).click();
      }
    },
    clickBackToKpiList: {
      value: function(kpiId) {
        element(by.id('back-to-kpi-list-button')).click();
      }
    },
    clickDisableKpi: {
      value: function(kpiId) {
        element(by.id('disable-' + kpiId + '-button')).click();
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