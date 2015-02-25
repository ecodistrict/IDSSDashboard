var ManageKpiPage = function () {
  browser.get('/#/analyse-problem/manage-kpis');
};

ManageKpiPage.prototype = Object.create({},
  {
    kpis: {
      get: function() {
        return element.all(by.repeater('kpi in kpiList'));
      }
    },
    kpiNameInput: {
      get: function() {
        return element(by.model('kpi.name'));
      }
    },
    kpiDescriptionInput: {
      get: function() {
        return element(by.model('kpi.description'));
      }
    },
    kpiUnitInput: {
      get: function() {
        return element(by.model('kpi.unit'));
      }
    },
    addKpiButton: {
      get: function() {
        return element(by.id('add-kpi-button'));
      }
    },
    publicKpiButton: {
      get: function() {
        return element(by.id('public-kpi-button'));
      }
    },
    privateKpiButton: {
      get: function() {
        return element(by.id('private-kpi-button'));
      }
    },
    saveKpiButton: {
      get: function() {
        return element(by.id('save-kpi-button'));
      }
    },
    cancelKpiButton: {
      get: function() {
        return element(by.id('cancel-kpi-button'));
      }
    },
    clickAddKpiButton: {
      value: function() {
        this.addKpiButton.click();
      }
    },
    clickSaveKpiButton: {
      value: function() {
        this.saveKpiButton.click();
      }
    },
    clickCancelKpiButton: {
      value: function() {
        this.cancelKpiButton.click();
      }
    },
    selectGeoJsonKpi: {
      get: function() {
        return element(by.id('select-kpi-geojson-test-kpi'));
      }
    },
    useGeoJsonKpiButton: {
      get: function() {
        return element(by.id('use-kpi-geojson-test-kpi'));
      }
    },
    deleteGeoJsonKpiButton: {
      get: function() {
        return element(by.id('delete-kpi-geojson-test-kpi'));
      }
    },
    connectedModules: {
      get: function() {
        return element.all(by.repeater('module in relevantModules'));
      }
    },
    selectedKpis: {
      get: function() {
        return element.all(by.repeater('kpi in asIsVariant.kpiList'));
      }
    },
    // this is the selected kpi
    usedGeoJsonKpi: {
      get: function() {
        return element(by.id('used-kpi-geojson-test-kpi'));
      }
    },
    kpiTitle: {
      get: function() {
        return element.all(by.css('.kpi-title'));
      }
    },
    kpiScoreExcellent: {
      get: function() {
        return element(by.id('kpi-score-excellent'));
      }
    },
    kpiScoreBad: {
      get: function() {
        return element(by.id('kpi-score-bad'));
      }
    },
    priorityValue: {
      get: function() {
        return element(by.id('priority-value'));
      }
    },
    saveKpiConfigButton: {
      get: function() {
        return element(by.id('save-kpi-config'));
      }
    },
    selectGeoJsonModuleOption: {
      get: function() {
        return element(by.cssContainingText('option', 'Geojson test module'));
      }
    },
    typeKpiName: {
      value: function(name) {
        this.kpiNameInput.sendKeys(name);
      }
    },
    typeKpiDescription: {
      value: function(description) {
        this.kpiDescriptionInput.sendKeys(description);
      }
    },
    typeKpiUnit: {
      value: function(unit) {
        this.kpiUnitInput.sendKeys(unit);
      }
    },
    clickUseGeoJsonKpiButton: {
      value: function() {
        this.useGeoJsonKpiButton.click();
      }
    },
    clickSelectGeoJsonKpi: {
      value: function() {
        this.selectGeoJsonKpi.click();
      }
    },
    clickUsedGeoJsonKpi: {
      value: function() {
        this.usedGeoJsonKpi.click();
      }
    },
    typeKpiScoreExcellent: {
      value: function(val) {
        this.kpiScoreExcellent.sendKeys(val);
      }
    },
    typeKpiScoreBad: {
      value: function(val) {
        this.kpiScoreBad.sendKeys(val);
      }
    },
    typePriorityValue: {
      value: function(val) {
        this.priorityValue.clear().sendKeys(val);
      }
    },
    clickSelectGeoJsonModuleOption: {
      value: function() {
        this.selectGeoJsonModuleOption.click();
      }
    },
    clickSaveKpiConfigButton: {
      value: function() {
        this.saveKpiConfigButton.click();
      }
    }
  }
);

module.exports = ManageKpiPage;