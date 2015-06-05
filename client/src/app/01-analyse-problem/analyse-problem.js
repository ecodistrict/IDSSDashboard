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

.controller( 'AnalyseProblemCtrl', ['$scope', 'ProcessService', 'LoginService', 'VariantService', '$state', function AnalyseProblemCtrl( $scope, ProcessService, LoginService, VariantService, $state ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  var currentUser;
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    $scope.facilitator = user.role === 'Facilitator';
    if($scope.facilitator) {
      LoginService.getStakeholders().then(function(stakeholders) {
        $scope.stakeholders = stakeholders;
      });
    }
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
        name: name,
        facilitatorId: currentUser._id,
        activeProcessId: currentUser.activeProcessId,
        role: 'Stakeholder',
        email: name + '@idssdashboard.com'
      };
      LoginService.createLogin(registrant).then(function(stakeholder) {
        $scope.stakeholders.push(stakeholder);
      });
    }
  };

  $scope.deleteStakeholder = function(stakeholder) {
    LoginService.deleteStakeholder(stakeholder).then(function(deletedStakeholder) {
      var index = _.indexOf($scope.stakeholders, stakeholder);
      $scope.stakeholders.splice(index, 1);
    });
  };

  $scope.loginStakeholder = function(stakeholder) {
    // get current users (facilitators) variants
    VariantService.loadVariants().then(function(facilitatorVariants) {
      LoginService.logout().then(function(loggedOut) {
        if(loggedOut === true) {
          LoginService.login({username: stakeholder.email, password: 'stakeholder'}).then(function(user) {
            VariantService.loadVariants().then(function(stakeholderVariants) {
              VariantService.addOrRemoveVariants(facilitatorVariants, stakeholderVariants);
              $state.transitionTo('analyse-problem');
            });
          });
        } else {
          console.log('TODO: handle this, user was not logged out');
        }
      });
    });
  };

}]);

