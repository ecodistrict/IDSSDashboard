angular.module( 'idss-dashboard.analyse-problem', [
  'idss-dashboard.analyse-problem.manage-kpis',
  'idss-dashboard.analyse-problem.use-kpi',
  'idss-dashboard.analyse-problem.configure-kpi',
  'idss-dashboard.analyse-problem.add-kpi'
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

.controller( 'AnalyseProblemCtrl', ['$scope', 'CaseService', 'LoginService', 'VariantService', '$state', function AnalyseProblemCtrl( $scope, CaseService, LoginService, VariantService, $state ) {

  $scope.currentCase = CaseService.getActiveCase();
  var currentUser;
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    $scope.facilitator = user.role === 'Facilitator';
    if($scope.facilitator) {
      LoginService.getAllStakeholders(user.activeCaseId).then(function(stakeholders) {
        _.each(stakeholders, function(s) {
          if(s.activeCaseId === $scope.currentCase._id) {
            s.isActiveCase = true;
          }
        });
        $scope.stakeholders = stakeholders;
      });
    }
  });

  $scope.updateCase = function(logMessage){
    CaseService.saveCurrentCase().then(function(savedCase) {
      console.log(savedCase);
    });
  };

  $scope.stakeholder = {
    name: '',
    email: '',
    password: ''
  };

  $scope.addStakeholder = function() {
    if($scope.stakeholder.name && $scope.stakeholder.email && $scope.stakeholder.password) {
      if(currentUser) {
        var registrant = {
          firstName: $scope.stakeholder.name,
          lastName: $scope.stakeholder.name,
          name: $scope.stakeholder.name,
          facilitatorId: currentUser._id,
          activeCaseId: currentUser.activeCaseId,
          role: 'Stakeholder',
          password: $scope.stakeholder.password,
          email: $scope.stakeholder.email
        };
        LoginService.createLogin(registrant).then(function(stakeholder) {
          if(stakeholder.message) {
            $scope.createStakeholderError = stakeholder.message;
          } else {
            $scope.createStakeholderError = "";
            $scope.stakeholders.push(stakeholder);
          }
        });
      } else {
        $scope.createStakeholderError = "Current user was not found (bug)";
      }
    } else {
      $scope.createStakeholderError = "Please provide name, email and password for stakeholder";
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
          LoginService.login({username: stakeholder.email, password: stakeholder.password}).then(function(user) {
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

  $scope.setToActiveCase = function(stakeholder) {
    LoginService.setActiveCase(stakeholder).then(function(updatedStakeholder) {
      if($scope.currentCase._id === updatedStakeholder.activeCaseId) {
        stakeholder.isActiveCase = true;
      } else {
        stakeholder.isActiveCase = false;
      }
    }); 
  };

}]);

