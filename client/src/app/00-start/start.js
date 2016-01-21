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

.controller( 'StartCtrl', ['$scope', 'ProcessService', '$state', function StartCtrl( $scope, ProcessService, $state ) {

  $scope.currentProcess = currentProcess = ProcessService.getCurrentProcess();

  ProcessService.getProcesses().then(function(processes) {
    _.each(processes, function(p) {
      console.log(p._id, currentProcess._id);
      if(p._id === currentProcess._id) {
        p.isActive = true;
      }
    });

    $scope.processes = processes;

  });
  
  $scope.startNewProcess = function() {
    ProcessService.createNewProcess().then(function(process) {
      $scope.processes.push(process);
      //$state.transitionTo('analyse-problem');
    });    
  };

  $scope.loadProcess = function(process) {
    var oldProcessId = currentProcess._id;
    ProcessService.loadProcess(process._id).then(function() {
      _.each($scope.processes, function(p) {
        console.log(p._id, oldProcessId, process._id);

        if(p._id === process._id) {
          p.isActive = true;
        }
        if(p._id === oldProcessId) {
          p.isActive = false;
        }
      });
      currentProcess = ProcessService.getCurrentProcess();
    });
  };

}]);

