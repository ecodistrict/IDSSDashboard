var ModulesPage = function () {
  browser.get('/#/modules');
};

ModulesPage.prototype = Object.create({},
  {
    modules: {
      get: function() {
        return element.all(by.repeater('module in modules'));
      }
    }
  }
);

module.exports = ModulesPage;