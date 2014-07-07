angular.module( 'idss-dashboard.current-user', [
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'current-user', {
    url: '/current-user',
    views: {
      "main": {
        controller: 'CurrentUserCtrl',
        templateUrl: 'user/user.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Analyse problem',
      authorizedRoles: ['facilitator']
    }
  });
})

.controller( 'CurrentUserCtrl', [function CurrentUserCtrl( $scope ) {
  

}]);

