angular.module( 'idss-dashboard.collect-data.define-context', [
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'define-context', {
    url: '/collect-data/define-context',
    views: {
      "main": {
        controller: 'DefineContextCtrl',
        templateUrl: '02-collect-data/define-context.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Define context',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'DefineContextCtrl', ['$scope', 'KpiService', 'CaseService', 'ContextService', '$modal', function DefineContextCtrl( $scope, KpiService, CaseService, ContextService, $modal ) {

  $scope.currentCase = CaseService.getActiveCase();

  console.log($scope);

  $scope.energyCost = {
    name: 'Energy cost',
    alias: 'energy-cost',
    value: null,
    displayString: null
  };

  $scope.climateChange = {
    name: 'Climate change',
    alias: 'climate-change',
    selectedOption: null,
    displayString: null
  };

  $scope.climateOptions = ['warmer climate', 'colder climate'];

  $scope.addContext = function(context) {
    if(!$scope.currentCase.contexts) {
      $scope.currentCase.contexts = [];
    }
    if(context.alias === 'energy-cost') {
      $scope.currentCase.contexts.push({
        name: context.name,
        alias: context.alias,
        value: context.value,
        displayString: context.name + ' change by ' + context.value + ' %' 
      });
    } else if (context.alias === 'climate-change') {
      $scope.currentCase.contexts.push({
        name: context.name,
        alias: context.alias,
        selectedOption: context.selectedOption,
        displayString: context.name + ' to ' + context.selectedOption
      });
    }
    CaseService.saveCurrentCase().then(function(savedCase) {
      console.log(savedCase);
    });

  };

  $scope.removeContext = function(context) {
    var foundContext = $scope.currentCase.contexts.find(function(c) {
      return c.alias === context.alias;
    });
    if(foundContext) {
      var index = $scope.currentCase.contexts.indexOf(foundContext);
      $scope.currentCase.contexts.splice(index, 1);
    }
    CaseService.saveCurrentCase().then(function(savedCase) {
      console.log(savedCase);
    });
  };

  $scope.useVariable = function(variable) {
    console.log('add this variable to currentCase.context.variables');
  };

}]);

