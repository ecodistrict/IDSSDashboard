angular.module( 'idss-dashboard', [
  'templates-app',
  'templates-common',
  'http-auth-interceptor',
  'ui.router',
  'idss-dashboard.header',
  'idss-dashboard.login',
  'idss-dashboard.start',
  'idss-dashboard.analyse-problem'
])

.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized'
})

.constant('USER_ROLES', {
    all: '*',
    facilitator: 'facilitator',
    stakeholder: 'stakeholder'
})

.config( function myAppConfig ( $stateProvider, $urlRouterProvider ) {
    $urlRouterProvider.otherwise( '/start' );
})

.run(function ($rootScope, AUTH_EVENTS) {
    // $rootScope.$on('$stateChangeStart', function (event, next) {
    //     var authorizedRoles = next.data.authorizedRoles;
    //     if (!AuthService.isAuthorized(authorizedRoles)) {
    //         event.preventDefault();
    //         if (AuthService.isAuthenticated()) {
    //             // user is not allowed
    //             $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
    //         } else {
    //             // user is not logged in
    //             $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
    //         }
    //     }
    // });
})

.controller( 'AppCtrl', [ '$scope', '$location', 'USER_ROLES', 'AUTH_EVENTS', 'authService', function AppCtrl ( $scope, $location, USER_ROLES, AUTH_EVENTS, authService ) {

    console.log('app ctrl');
    console.log(USER_ROLES);

    // $scope.currentUser = null;
    // $scope.userRoles = USER_ROLES;
    // $scope.isAuthorized = AuthService.isAuthorized;

    // $scope.$on(AUTH_EVENTS.notAuthenticated, function() {
    //     console.log('not authenticated');
        
    // });
    // $scope.$on(AUTH_EVENTS.notAuthorized, function() {
    //     console.log('not authorized');
    // });

    $scope.$on('event:auth-loginRequired', function() {
        console.log('login required');
        console.log('not authenticated - login service redirect');
        $location.path('/login'); 
    });
    $scope.$on('event:auth-loginConfirmed', function() {
        console.log('login confirmed');
    });

    $scope.$on('$stateChangeSuccess', function(event, toState){

        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = 'Ecodistr-ict Dashboard | ' + toState.data.pageTitle;
        }
    });

}]);
