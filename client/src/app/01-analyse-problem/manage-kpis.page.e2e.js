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
    selectAtomicTestKpi: {
      get: function() {
        return element(by.id('select-kpi-atomic-test'));
      }
    },
    selectQualitativeKpi: {
      get: function() {
        return element(by.id('select-kpi-qualitative-kpi'));
      }
    },
    useKpiButton: {
      get: function() {
        return element(by.id('use-kpi-button'));
      }
    },
    deleteGeoJsonKpiButton: {
      get: function() {
        return element(by.id('delete-kpi-geojson-test-kpi'));
      }
    },
    cancelUseKpiDialogButton: {
      get: function() {
        return element(by.id('cancel-use-kpi-dialog'));
      }
    },
    clickCancelUseKpiDialogButton: {
      value: function() {
        this.cancelUseKpiDialogButton.click();
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
    // this is the selected kpis (right side in gui)
    usedGeoJsonKpi: {
      get: function() {
        return element(by.id('used-kpi-geojson-test-kpi'));
      }
    },
    usedAtomicTestKpi: {
      get: function() {
        return element(by.id('used-kpi-atomic-test'));
      }
    },
    usedQualitativeKpi: {
      get: function() {
        return element(by.id('used-kpi-qualitative-kpi'));
      }
    },
    kpiTitle: {
      get: function() {
        return element.all(by.css('.kpi-title'));
      }
    },
    kpiScoreExcellent: {
      get: function() {
        return element(by.id('kpiScoreExcellent'));//camelCase because generated by input spec
      }
    },
    kpiScoreBad: {
      get: function() {
        return element(by.id('kpiScoreBad'));//camelCase because generated by input spec
      }
    },
    priorityValue: {
      get: function() {
        return element(by.id('priorityValue'));//camelCase because generated by input spec
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
    selectAtomicTestModuleOption: {
      get: function() {
        return element(by.cssContainingText('option', 'Atomic inputs'));
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
    clickSelectKpi: {
      value: function(kpiId) {
        element(by.id('select-kpi-' + kpiId)).click();
      }
    },
    clickConfigureKpi: {
      value: function(kpiId) {
        element(by.id('used-kpi-' + kpiId)).click();
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
    clickUseKpiButton: {
      value: function() {
        this.useKpiButton.click();
      }
    },
    clickSelectAtomicTestKpi: {
      value: function() {
        this.selectAtomicTestKpi.click();
      }
    },
    clickUsedAtomicTestKpi: {
      value: function() {
        this.usedAtomicTestKpi.click();
      }
    },
    clickUsedQualitativeKpi: {
      value: function() {
        this.usedQualitativeKpi.click();
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
    clickSelectAtomicTestModuleOption: {
      value: function() {
        this.selectAtomicTestModuleOption.click();
      }
    },
    clickSaveKpiConfigButton: {
      value: function() {
        this.saveKpiConfigButton.click();
      }
    },
    qualitativeKpiButton: {
      get: function() {
        return element(by.id('qualitative-kpi-button'));
      }
    },
    selectQualitativeKpiOption: {
      value: function() {
        this.qualitativeKpiButton.click();
      }
    },
    clickSelectQualitativeKpiFromList: {
      value: function() {
        this.selectQualitativeKpi.click();
      }
    }
  }
);

module.exports = ManageKpiPage;