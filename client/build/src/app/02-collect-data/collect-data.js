angular.module( 'idss-dashboard.collect-data', [
  'idss-dashboard.collect-data.define-context',
  'idss-dashboard.collect-data.module-input'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'collect-data', {
    url: '/collect-data',
    views: {
      "main": {
        controller: 'CollectDataCtrl',
        templateUrl: '02-collect-data/collect-data.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Collect Data',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'CollectDataCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', function CollectDataCtrl( $scope, KpiService, ProcessService, $modal ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  $scope.moduleList = [];
  console.log($scope.currentProcess);
  _.each($scope.currentProcess.kpiList, function(kpi) {
    if(kpi.selectedModule) {
      $scope.moduleList.push({
        kpi: kpi, 
        module: kpi.selectedModule
      });
    }
  });

  $scope.moduleIndataIsOk = function(module) {
    return false;
  };

}]);

