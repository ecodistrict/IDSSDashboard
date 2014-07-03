angular.module( 'idss-dashboard', [
  'templates-app',
  'templates-common',
  'ui-router',
  'idss-dashboard.analyse-problem'
])

.controller( 'AppCtrl', [ '$scope', '$location', function AppCtrl ( $scope, $location ) {
  $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){
    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = 'Ecodistr-ict Dashboard | ' + toState.data.pageTitle;
    }
  });
}]);
