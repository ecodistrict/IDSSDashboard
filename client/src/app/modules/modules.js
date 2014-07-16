angular.module( 'idss-dashboard.modules', [
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'modules', {
    url: '/modules',
    views: {
      "main": {
        controller: 'ModulesCtrl',
        templateUrl: 'modules/modules.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Modules',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'ModulesCtrl', ['$scope', 'ModuleService', function ModulesCtrl( $scope, ModuleService ) {

  ModuleService.getAllModules().then(function(modules) {
    $scope.modules = modules;
  });

}]);

