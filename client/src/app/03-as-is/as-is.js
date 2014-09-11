angular.module( 'idss-dashboard.as-is', [
  'idss-dashboard.as-is.map',
  'idss-dashboard.as-is.details'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'as-is-overview', {
    url: '/as-is',
    views: {
      "main": {
        controller: 'AsIsController',
        templateUrl: '03-as-is/as-is.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'As is',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'AsIsController', ['$scope', 'ProcessService', function AsIsController( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  // All calculations needs an indicator to show calculation progress

  // The results are saved in the modules and shown in results
  

}]);

