angular.module( 'idss-dashboard.develop-variants', [])

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

.controller( 'DevelopVariantsController', ['$scope', 'ProcessService', function DevelopVariantsController( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  
  // develop variants, the modules will provide alternatives, or in worst case only a new set of input data  

  // select alternatives, provide input for the modules and connect this alternative to a context

  // this creates a variant and a new calculation

}]);

