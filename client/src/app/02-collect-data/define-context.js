angular.module( 'idss-dashboard.collect-data.define-context', [
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'define-context', {
    url: '/define-context',
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
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'DefineContextCtrl', ['$scope', 'KpiService', 'ProcessService', 'ContextService', '$modal', function DefineContextCtrl( $scope, KpiService, ProcessService, ContextService, $modal ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  console.log($scope.currentProcess);

  ContextService.getContextFromCurrentProcess($scope.currentProcess).then(function(contextList) {
    console.log(contextList);
    $scope.contextList = contextList;
  });

}]);

