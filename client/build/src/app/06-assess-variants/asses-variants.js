angular.module( 'idss-dashboard.asses-variants', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'asses-variants', {
    url: '/asses-variants',
    views: {
      "main": {
        controller: 'AssesVariantsController',
        templateUrl: '06-asses-variants/asses-variants.tpl.html'
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

.controller( 'AssesVariantsController', ['$scope', 'ProcessService', function AssesVariantsController( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  
  // this is a list of variant calculations with progress indicator

  // variants can be compared and if you go back you can develop a new variant to be added to this page

}]);

