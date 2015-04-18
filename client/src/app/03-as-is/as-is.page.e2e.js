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
    }
  }
);

module.exports = AsIsPage;