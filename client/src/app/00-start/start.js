angular.module( 'idss-dashboard.start', [
  'ui.router'
])

.config(function config( $stateProvider ) {
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
    data:{ pageTitle: 'Start' },
    authorizedRoles: ['*']
  });
})

.controller( 'StartCtrl', ['$scope', 'LoginService', function StartCtrl( $scope ) {
  
  console.log('start ctrl');

}]);

