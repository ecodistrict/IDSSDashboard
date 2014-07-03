angular.module( 'idss-dashboard', [
  'templates-app',
  'templates-common',
  'ui.router',
  'idss-dashboard.header',
  'idss-dashboard.start',
  'idss-dashboard.analyse-problem'
])

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
  $urlRouterProvider.otherwise( '/start' );
})

.controller( 'AppCtrl', [ '$scope', '$location', function AppCtrl ( $scope, $location ) {

  console.log('app ctrl');

  $scope.$on('$stateChangeSuccess', function(event, toState){

    if ( angular.isDefined( toState.data.pageTitle ) ) {
      $scope.pageTitle = 'Ecodistr-ict Dashboard | ' + toState.data.pageTitle;
    }
  });

}]);
