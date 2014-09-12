angular.module( 'idss-dashboard.as-is', [
  // 'idss-dashboard.as-is.map',
  // 'idss-dashboard.as-is.details'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'as-is', {
    url: '/as-is',
    views: {
      "main": {
        controller: 'AsIsController',
        templateUrl: '03-as-is/as-is.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'As is',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'AsIsController', ['$scope', 'ProcessService', '$timeout', function AsIsController( $scope, ProcessService, $timeout ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  _.each($scope.currentProcess.kpiList, function(kpi) {
    kpi.selectedModule.isProcessing = true;
    kpi.selectedModule.status = 'default';
    $timeout(function() {
      kpi.selectedModule.isProcessing = false;
      kpi.selectedModule.status = 'success';
      $scope.processing = modulesAreProcessing();
    }, Math.floor(Math.random() * (3000 - 1000)) + 1000);
  });

  var modulesAreProcessing = function() {
    var processing = false;
    _.each($scope.currentProcess.kpiList, function(kpi) {
      if(kpi.selectedModule.isProcessing) {
        processing = true;
      }
    });
    return processing;
  };

  $scope.processing = modulesAreProcessing();

  // All calculations needs an indicator to show calculation progress

  // The results are saved in the modules and shown in results
  

}]);

