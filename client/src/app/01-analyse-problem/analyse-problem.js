angular.module( 'idss-dashboard.analyse-problem', [
  'idss-dashboard.analyse-problem.manage-kpis',
  'idss-dashboard.analyse-problem.use-kpi',
  'idss-dashboard.analyse-problem.configure-kpi',
  'idss-dashboard.analyse-problem.add-kpi',
  'idss-dashboard.analyse-problem.kpi-input'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'analyse-problem', {
    url: '/analyse-problem',
    views: {
      "main": {
        controller: 'AnalyseProblemCtrl',
        templateUrl: '01-analyse-problem/analyse-problem.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Analyse problem',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    }
  });
}])

.controller( 'AnalyseProblemCtrl', ['$scope', 'ProcessService', 'LoginService', 'VariantService', function AnalyseProblemCtrl( $scope, ProcessService, LoginService, VariantService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  var currentUser;
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    LoginService.getStakeholders().then(function(stakeholders) {
      $scope.stakeholders = stakeholders;
    });
  });

  $scope.updateProcess = function(logMessage){
    ProcessService.saveCurrentProcess().then(function(process) {
      console.log(process);
    });
  };

  $scope.addStakeholder = function(name) {
    if(currentUser) {
      var registrant = {
        firstName: name,
        lastName: name,
        facilitatorId: currentUser._id,
        activeProcessId: currentUser.activeProcessId,
        role: 'Stakeholder',
        email: name + '@iddsdashboard.com'
      };
      LoginService.createLogin(registrant).then(function(stakeholder) {
        console.log(stakeholder);
        LoginService.getStakeholders().then(function(stakeholders) {
          $scope.stakeholders = stakeholders;
        });
      });
    }
  };

  $scope.loginStakeholder = function(stakeholder) {
    // get current users (facilitators) variants
    VariantService.loadVariants().then(function(facilitatorVariants) {
      LoginService.logout().then(function(loggedOut) {
        if(loggedOut === true) {
          LoginService.login({username: stakeholder.email, password: 'testing'}).then(function(user) {
            VariantService.loadVariants().then(function(stakeholderVariants) {
              VariantService.addOrRemoveVariants(facilitatorVariants, stakeholderVariants);
            });
          });
        } else {
          console.log('TODO: handle this, user was not logged out');
        }
      });
    });
  };

}]);

