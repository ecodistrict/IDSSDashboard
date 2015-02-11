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
    }
  }
);

module.exports = ManageKpiPage;