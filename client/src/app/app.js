angular.module( 'idss-dashboard', [
  'templates-app',
  'templates-common',
  'http-auth-interceptor',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'angularFileUpload',
  'angular-flash.service', 
  'angular-flash.flash-alert-directive',
  'idss-dashboard.header',
  'idss-dashboard.login',
  'idss-dashboard.register',
  'idss-dashboard.export',
  'idss-dashboard.user',
  'idss-dashboard.start',
  'idss-dashboard.modules',
  'idss-dashboard.analyse-problem',
  'idss-dashboard.collect-data',
  'idss-dashboard.as-is',
  'idss-dashboard.to-be',
  'idss-dashboard.develop-variants',
  'idss-dashboard.assess-variants',
  'idss-dashboard.compare-variants',
  'idss-dashboard.qualitative-kpi-input',
  'idss-dashboard.quantitative-kpi-input',
  'idss-dashboard.kpi-weight',
  'idss-dashboard.kpi',
  'idss-dashboard.kpi-map',
  'idss-dashboard.file-connection'
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
    facilitator: 'Facilitator',
    stakeholder: 'Stakeholder'
})

.config(['$urlRouterProvider', 'flashProvider', function myAppConfig ( $urlRouterProvider, flashProvider) {
    $urlRouterProvider.otherwise( '/start' );
    flashProvider.errorClassnames.push('alert-danger');
}])

.controller( 'AppCtrl', [ '$scope', '$rootScope', '$location', 'USER_ROLES', 'authService', 'LoginService', 'CaseService', 'socket', 'ModuleService', '$state', 'VariantService', 'NotificationService', function AppCtrl ( $scope, $rootScope, $location, USER_ROLES, authService, LoginService, CaseService, socket, ModuleService, $state, VariantService, NotificationService) {

    var init = function(user) {
      $scope.isAuthenticated = LoginService.isAuthenticated();
      $scope.currentUser = user;
      // while waiting for current case to load use the default empty case from case service
      $scope.activeCase = CaseService.getActiveCase();

      // load current case
      CaseService.loadActiveCase().then(function(activeCase) {
        $scope.activeCase = activeCase;
        VariantService.loadVariants().then(function(variants) {
          $scope.variants = variants;
        });
      });
  
      socket.emit('privateRoom', $scope.currentUser);

      socket.emit('getModules', {kpiList: []});

      socket.on('getModules', function(moduleData) {
        console.log(moduleData);
        // add module to catalog
        ModuleService.addModule(moduleData);
        // extend kpi data with module data if needed
        var kpi = _.find($scope.activeCase.kpiList, function(k) {
          return k.selectedModuleId === moduleData.moduleId;
        });
        if(kpi) {
          kpi.selectedModuleName = moduleData.name;
          kpi.selectedModuleDescription = moduleData.description;
        }
      });
      
      socket.on('frameworkError', function(err) {
        console.log('Error from server (framework): ' + err.message);
        NotificationService.createErrorFlash(err.message);
      });

      socket.on('dashboardError', function(err) {
        console.log('Error from server (dashboard): ' + err.message);
        NotificationService.createErrorFlash(err.message);
      });

      socket.on('frameworkActivity', function(messageObject) {
        messageObject = JSON.parse(messageObject);
        var label = messageObject.message;
        console.log(label);
        NotificationService.createInfoFlash(label);
      });

      // socket.on('getKpiResult', function(kpiMessage) {
      //   var kpi = _.find($scope.activeCase.kpiList, function(k) {
      //     return k.kpiAlias === kpiMessage.kpiId;
      //   });
      //   console.log(kpi);
      //   if(kpi) {
      //     console.log(kpi);
      //     console.log('set kpi ' + kpi.kpiAlias + ' to ' + kpiMessage.kpiValue);
      //     kpi.value = kpiMessage.kpiValue;
      //     kpi.loading = false;
      //     kpi.status = kpiMessage.status;
      //   }
      // });

      socket.on('createVariant', function(message) {
        console.log('create variant returned:', message);
      });


      // register event to check auth on page change
      $rootScope.$on('$stateChangeStart', function (event, next) {

        var authorizedRoles = next.data.authorizedRoles;

        if (!LoginService.isAuthorized(authorizedRoles) && next.url !== '/login') {
              
          event.preventDefault();
          if (LoginService.isAuthenticated()) {
            // user is authenticated but not authorized - we could inform that
            // for now, send user to login
            $rootScope.$broadcast('event:auth-loginRequired');
          } else {
            $rootScope.$broadcast('event:auth-loginRequired');
          }
        } 
      });
    };
    // if already logged in
    LoginService.getCurrentUser().then(function(user) {
      console.log('already logged in');
      init(user);
      //$state.transitionTo('start');
    });

    // global event - going into unauth state
    $scope.$on('event:auth-loginRequired', function(e) {
        console.log('login required');
        $scope.isAuthenticated = LoginService.isAuthenticated();
        // TODO: fix this, page freezes
        $state.transitionTo('login');
    });

    // global event - going into auth state after login
    $scope.$on('event:auth-loginConfirmed', function() {
        console.log('login confirmed');
        LoginService.getCurrentUser().then(function(user) {
          init(user);
          $state.transitionTo('start');
        });
    });

    $scope.$on('$stateChangeSuccess', function(event, toState){

        if ( angular.isDefined( toState.data.pageTitle ) ) {
            $scope.pageTitle = 'Ecodistr-ict Dashboard | ' + toState.data.pageTitle;
        }
    });    

}]).factory('socket', ['socketFactory', function (socketFactory) {
  return socketFactory();
}]);