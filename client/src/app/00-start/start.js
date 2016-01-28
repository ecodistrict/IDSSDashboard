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
      socket.emit('createCase', {
        caseId: createdCase._id,
        userId: createdCase.userId
      });
      createdCase.loading = true;
      $scope.cases.push(createdCase);
    });    
  };

  $scope.deleteCase = function(caseItem) {
    caseItem.loading = true;
    socket.emit('deleteCase', {
      caseId: caseItem._id,
      userId: caseItem.userId
    });  
  };

  socket.on('deleteCase', function(message) {
    CaseService.deleteCase({_id: message.caseId}).then(function(deletedCase) {
      var caseItem = _.find($scope.cases, function(c) {
        return c._id === deletedCase._id;
      });
      caseItem.loading = false;
      // remove from list
      var index = _.indexOf($scope.cases, caseItem);
      if (index > -1) {
          $scope.cases.splice(index, 1);
      }
    });  
  });

  socket.on('createCase', function(message) {
    var caseItem = _.find($scope.cases, function(c) {
      return c._id === message.caseId;
    });
    caseItem.loading = false;
  });

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

