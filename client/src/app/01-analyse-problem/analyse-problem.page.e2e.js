var AnalyseProblemOverview = function () {
  browser.get('/#/analyse-problem');
};

AnalyseProblemOverview.prototype = Object.create({},
  {
    // districtMap: {
    //   get: function() {
    //     return element(by.id('district-map'));
    //   }
    // },
    // clickDistrictMap: {
    //   value: function(toRight, toBottom, doubleClick) {
    //     this.districtMap.
    //   }
    // },
    processTitle: {
      get: function() {
        return element(by.id('process-title'));
      }
    },
    inputProcessTitle: {
        value: function(input) {
            this.processTitle.clear().sendKeys(input);
        }
    },
    processDescription: {
      get: function() {
        return element(by.id('process-description'));
      }
    },
    inputProcessDescription: {
        value: function(input) {
            this.processDescription.clear().sendKeys(input);
        }
    },
    editDistrictPolygonButton: {
      get: function() {
        return element(by.id('edit-district-polygon'));
      }
    },
    clickEditDistrictPolygonButton: {
        value: function(input) {
            this.editDistrictPolygonButton.click();
        }
    },
    saveDistrictPolygonButton: {
      get: function() {
        return element(by.id('save-district-polygon'));
      }
    },
    clickSaveDistrictPolygonButton: {
        value: function(input) {
            this.saveDistrictPolygonButton.click();
        }
    },
    nextButton: {
      get: function() {
        return element(by.id('next-button'));
      }
    },
    clickNextButton: {
      value: function() {
        this.nextButton.click();
      } 
    }
  }
);

module.exports = AnalyseProblemOverview;