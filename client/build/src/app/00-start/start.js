angular.module( 'idss-dashboard.start', [
  'idss-dashboard.start.upload'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'start', {
    url: '/start',
    views: {
      "main": {
        controller: 'StartCtrl',
        templateUrl: '00-start/start.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Start',
      authorizedRoles: ['*']
    }
  });
}])

.controller( 'StartCtrl', ['$scope', 'ProcessService', '$state', function StartCtrl( $scope, ProcessService, $state ) {
  
  console.log('start ctrl');

  $scope.startNewProcess = function() {
    ProcessService.createNewProcess().then(function() {
      $state.transitionTo('analyse-problem');
    });
  };

}]);

