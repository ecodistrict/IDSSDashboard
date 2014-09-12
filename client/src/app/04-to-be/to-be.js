angular.module( 'idss-dashboard.to-be', [
  // 'idss-dashboard.to-be.map',
  // 'idss-dashboard.to-be.details'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'to-be-overview', {
    url: '/to-be',
    views: {
      "main": {
        controller: 'ToBeController',
        templateUrl: '03-to-be/to-be.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'To be',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'ToBeController', ['$scope', 'ProcessService', function ToBeController( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  // Show list of KPI - these should be configured for the TO BE state

  // create calculations for optimization to map to the desired values (this is actually not feasible)
  

}]);

