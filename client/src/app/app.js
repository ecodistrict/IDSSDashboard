angular.module( 'idss-dashboard', [
  'templates-app',
  'templates-common',
  'http-auth-interceptor',
  'ui.router',
  'idss-dashboard.header',
  'idss-dashboard.login',
  'idss-dashboard.current-user',
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

.controller( 'AppCtrl', [ '$scope', '$rootScope', '$location', 'USER_ROLES', 'authService', 'LoginService', 'ProcessService', function AppCtrl ( $scope, $rootScope, $location, USER_ROLES, authService, LoginService, ProcessService ) {

    // if already logged in
    LoginService.getCurrentUser().then(function(user) {
        $scope.isAuthenticated = LoginService.isAuthenticated();
        $scope.currentUser = user;

        $rootScope.$on('$stateChangeStart', function (event, next) {
          var authorizedRoles = next.data.authorizedRoles;
          if (!LoginService.isAuthorized(authorizedRoles)) {
              event.preventDefault();
              if (LoginService.isAuthenticated()) {
                  // user is not allowed
                  $rootScope.$broadcast('event:auth-loginRequired');
              } else {
                  // user is not logged in
                  console.log('TODO: handle role');
              }
          } else {
            var currentProcess = ProcessService.getCurrentProcess();
            if(currentProcess.isModified) {
              ProcessService.saveCurrentProcess().then(function() {
                console.log('current process was saved');
              });
            }
          }
      });

    });

    // global event - going into unauth state
    $scope.$on('event:auth-loginRequired', function() {
        console.log('login required');
        $scope.isAuthenticated = LoginService.isAuthenticated();
        $location.path('/login'); 
    });

    // global event - going into auth state after login
    $scope.$on('event:auth-loginConfirmed', function() {
        console.log('login confirmed');
        $scope.isAuthenticated = LoginService.isAuthenticated();
        $scope.currentUser = user;
        $location.path('/start');
    });

    $scope.$on('$stateChangeSuccess', function(event, toState){

        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = 'Ecodistr-ict Dashboard | ' + toState.data.pageTitle;
        }
    });

}]);
