angular.module( 'idss-dashboard.start', [
  'idss-dashboard.start.upload'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'start', {
    url: '/start',
    views: {
      "main": {
        controller: 'StartCtrl',
        templateUrl: '00-start/start.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Start',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    }
  });
}])

.controller( 'StartCtrl', ['$scope', 'CaseService', '$state', 'socket', 'LoginService', function StartCtrl( $scope, CaseService, $state, socket, LoginService ) {

  $scope.cases = [];
  $scope.activeCase = {};

  CaseService.loadActiveCase().then(function(activeCase) {
    
    $scope.activeCase = activeCase;

    CaseService.loadCases().then(function(cases) {
      _.each(cases, function(c) {
        if(c._id === $scope.activeCase._id) {
          c.isActive = true;
        }
      });
      $scope.cases = cases;
    });
  });
  
  $scope.createNewCase = function() {
    CaseService.createNewCase().then(function(createdCase) {
      $scope.cases.push(createdCase);
    });    
  };

  $scope.loadCase = function(caseToLoad) {
    var oldCaseId = $scope.activeCase._id;
    CaseService.loadCase(caseToLoad._id).then(function() {
      _.each($scope.cases, function(c) {
        if(c._id === caseToLoad._id) {
          c.isActive = true;
        }
        if(c._id === oldCaseId) {
          c.isActive = false;
        }
      });
      // the case has now been reloaded from server in service
      $scope.activeCase = CaseService.getActiveCase();
    });
  };

}]);

