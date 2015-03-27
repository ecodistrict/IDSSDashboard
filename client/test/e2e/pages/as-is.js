var AsIsPage = function () {
  browser.get('/#/as-is');
};

AsIsPage.prototype = Object.create({},
  {
    kpiOutputs: {
      get: function() {
        return element.all(by.repeater('kpi in kpiOutputs'));
      }
    }
  }
);

module.exports = AsIsPage;