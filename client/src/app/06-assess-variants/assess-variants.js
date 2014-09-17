angular.module( 'idss-dashboard.assess-variants', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'assess-variants', {
    url: '/assess-variants',
    views: {
      "main": {
        controller: 'AssessVariantsController',
        templateUrl: '06-assess-variants/assess-variants.tpl.html'
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

.controller( 'AssessVariantsController', ['$scope', 'ProcessService', function AssessVariantsController( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

}]);

