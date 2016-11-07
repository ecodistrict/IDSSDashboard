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

  socket.forward('createCase', $scope);
  socket.forward('deleteCase', $scope);

  var currentUser;
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    $scope.facilitator = user.role === 'Facilitator';
  });

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
      
      // signal remove - dashboard works stand alone, create some check to see database status
      socket.emit('createCase', {
        caseId: createdCase._id,
        userId: createdCase.userId
      });

      $scope.cases.push(createdCase);

    });    
  };

  $scope.deleteCase = function(caseItem) {

    CaseService.deleteCase(caseItem).then(function(deletedCase) {  

      // signal remove - dashboard works stand alone, create some check to see database status
      socket.emit('deleteCase', {
        caseId: caseItem._id,
        userId: caseItem.userId
      });  
      // remove from list
      var index = _.indexOf($scope.cases, caseItem);
        if (index > -1) {
            $scope.cases.splice(index, 1);
        }
    }); 
  };

  $scope.checkDataModuleStatus = function(caseItem) {

    caseItem.loading = true;
    
    socket.emit('createCase', {
      caseId: caseItem._id,
      userId: caseItem.userId,
      title: caseItem.title,
      description: caseItem.description
    });  
      
  };

  $scope.$on('socket:createCase', function (ev, data) {
    var caseItem = _.find($scope.cases, function(c) {
      return c._id === data.caseId;
    });
    console.log(data);
    caseItem.loading = false;
    caseItem.dataModuleStatus = data.status;
  });

  // $scope.$on('socket:deleteCase', function (ev, data) {
  //   var caseItem = _.find($scope.cases, function(c) {
  //     return c._id === data.caseId;
  //   });

  //   if(caseItem) {
  //     CaseService.deleteCase({_id: data.caseId}).then(function(deletedCase) {
        
  //       caseItem.loading = false;
  //       // remove from list
  //       var index = _.indexOf($scope.cases, caseItem);
  //       if (index > -1) {
  //           $scope.cases.splice(index, 1);
  //       }
  //     }); 
  //   } else {
  //     console.log('case item was not found');
  //   }
  // });

  $scope.editCaseData = function(caseToEdit) {
    $scope.loadCase(caseToEdit);
    $state.transitionTo('analyse-problem');
  };

  $scope.loadCase = function(caseToLoad) {
    var activeCase;
    CaseService.loadCase(caseToLoad._id).then(function() {
      _.each($scope.cases, function(c) {
        if(c._id === caseToLoad._id) {
          activeCase = c;
        } 
        c.isActive = false;
      });
      activeCase.isActive = true;
      // the case has now been reloaded from server in service
      $scope.activeCase = CaseService.getActiveCase();
    });
  };

}]);

