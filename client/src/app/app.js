angular.module( 'idss-dashboard', [
  'templates-app',
  'templates-common'
])

.controller( 'AppCtrl', [ '$scope', '$location', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = 'Ecodistr-ict Dashboard | ' + toState.data.pageTitle;
    }
  });
}]);
