angular.module( 'idss-dashboard.develop-variants', [
  'idss-dashboard.develop-variants.use-alternatives',
  'idss-dashboard.develop-variants.variant-overview'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'develop-variants', {
    url: '/develop-variants',
    views: {
      "main": {
        controller: 'DevelopVariantsController',
        templateUrl: '05-develop-variants/develop-variants.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Develop variants',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'DevelopVariantsController', ['$scope', 'ProcessService', 'ContextService', '$modal', '$state', function DevelopVariantsController( $scope, ProcessService, ContextService, $modal, $state ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  $scope.selectedAlternative = null;
  $scope.selectedContext = null;

  $scope.moduleList = [];
  console.log($scope.currentProcess);
  _.each($scope.currentProcess.kpiList, function(kpi) {
    if(kpi.selectedModule) {
      $scope.moduleList.push(
        kpi.selectedModule
      );
    }
  });

  ContextService.getContextVariables($scope.currentProcess).then(function(contexts) {
    console.log(contexts);
    $scope.selectableContextVariables = contexts;
  });

  $scope.useAlternative = function(module) {

    var alternativeModal = $modal.open({
      templateUrl: '05-develop-variants/use-alternatives.tpl.html',
      controller: 'UseAlternativeCtrl',
      resolve: {
        module: function() {
          return module;
        }
      }
    });

    alternativeModal.result.then(function (alternativeModule) {
      $scope.selectedAlternative = alternativeModule.selectedAlternative;
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.selectContext = function(context) {
    $scope.selectedContext = context;
  };

  $scope.addVariant = function() {
    ProcessService.addVariant($scope.selectedAlternative, $scope.selectedContext);
    $state.transitionTo('variant-overview');
  };
  
  // develop variants, the modules will provide alternatives, or in worst case only a new set of input data  

  // select alternatives, provide input for the modules and connect this alternative to a context

  // this creates a variant and a new calculation

}]);

