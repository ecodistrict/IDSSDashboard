angular.module( 'idss-dashboard.collect-data.define-context', [
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'define-context', {
    url: '/define-context',
    views: {
      "main": {
        controller: 'DefineContextCtrl',
        templateUrl: '02-collect-data/define-context.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Define context',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'DefineContextCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', function DefineContextCtrl( $scope, KpiService, ProcessService, $modal ) {

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

    kpiModal.result.then(function (useKpi) {
      ProcessService.addKpi(angular.copy(useKpi));
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

    kpiModal.result.then(function (configuredKpi) {
      console.log(configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.kpiIsManaged = function(kpi) {
    return false;
  };

}]);

