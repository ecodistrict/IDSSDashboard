angular.module( 'idss-dashboard.analyse-problem.manage-kpis', [
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'manage-kpis', {
    url: '/analyse-problem/manage-kpis',
    views: {
      "main": {
        controller: 'ManageKpisCtrl',
        templateUrl: '01-analyse-problem/manage-kpis.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Manage KPIs',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'ManageKpisCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', function ManageKpisCtrl( $scope, KpiService, ProcessService, $modal ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();
  console.log($scope.currentProcess);
  $scope.kpiList = [];

  KpiService.loadKpis().then(function(kpiList) {
    $scope.kpiList = kpiList;
  });

  $scope.useKpi = function(kpi) {

    var kpiModal = $modal.open({
      templateUrl: '01-analyse-problem/use-kpi.tpl.html',
      controller: 'UseKpiCtrl',
      resolve: {
        kpi: function() {
          return kpi;
        }
      }
    });

    kpiModal.result.then(function (useKPI) {
      ProcessService.addKpi(angular.copy(useKPI));
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.configureKpi = function(kpi) {

    var kpiModal = $modal.open({
      templateUrl: '01-analyse-problem/configure-kpi.tpl.html',
      controller: 'ConfigureKpiCtrl',
      resolve: {
        kpi: function() {
          return kpi;
        }
      }
    });

    kpiModal.result.then(function (useKPI) {
      ProcessService.addKpi(angular.copy(useKPI));
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.kpiIsManaged = function(kpi) {
    return false;
  };

}]);

