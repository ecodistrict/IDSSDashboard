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

  var activeCase = $scope.activeCase = CaseService.loadActiveCase();
  $scope.cases = [];

  CaseService.loadCases().then(function(cases) {
    $scope.cases = cases;
  });
  
  $scope.createNewCase = function() {
    CaseService.createNewCase().then(function(createdCase) {
      $scope.cases.push(createdCase);
    });    
  };

  $scope.loadCase = function(caseToLoad) {
    var oldCaseId = activeCase._id;
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
      activeCase = CaseService.getActiveCase();
    });
  };

}]);

