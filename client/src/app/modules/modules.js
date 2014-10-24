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
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'ModulesCtrl', ['$scope', 'ModuleService', function ModulesCtrl( $scope, ModuleService ) {

  $scope.moduleService = ModuleService;

  $scope.$watch('moduleService.getAllModules()', function(newList, oldList) {
    if(newList !== oldList) {
      $scope.modules = newList;
    }
  }); 

  $scope.modules = ModuleService.getAllModules();

}]);

