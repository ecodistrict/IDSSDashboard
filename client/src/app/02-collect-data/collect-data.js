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
      $scope.moduleList.push({kpi: kpi.name, module: kpi.selectedModule.name});
    }
  });

  $scope.configureKpi = function(kpi) {

    var kpiModal = $modal.open({
      templateUrl: '02-collect-data/module-indata.tpl.html',
      controller: 'ModuleIndataCtrl',
      resolve: {
        kpi: function() {
          return kpi;
        }
      }
    });

    kpiModal.result.then(function (configuredKpi) {
      console.log(configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.moduleIndataIsOk = function(module) {
    return false;
  };

}]);

