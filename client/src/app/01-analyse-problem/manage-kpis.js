angular.module( 'idss-dashboard.analyse-problem.manage-kpis', [])

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
    resolve:{
      process: ['ProcessService', function(ProcessService) {
        var p = ProcessService.getCurrentProcess();
        if(p._id) {
          return p;
        } else {
          return ProcessService.loadCurrentProcess();
        }
      }]
    }, 
    data:{ 
      pageTitle: 'Manage KPIs',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'ManageKpisCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', 'ModuleService', 'VariantService', 'process', function ManageKpisCtrl( $scope, KpiService, ProcessService, $modal, ModuleService, VariantService, process) {

  $scope.currentProcess = process;

  // Kpi database  
  $scope.kpiList = [];
  KpiService.loadKpis().then(function(kpiList) {  
    $scope.kpiList = kpiList;
  });

  // Use KPI in process 
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
      // add copy of this KPI to as is variant
      ProcessService.addKpi(angular.copy(useKpi));
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.useKpiQuick = function(useKpi) {
    // add copy of this KPI to as is variant
      ProcessService.addKpi(angular.copy(useKpi));
  };

  // Add KPI to KPI repository
  $scope.addKpi = function() {

    var kpiModal = $modal.open({
      templateUrl: '01-analyse-problem/add-kpi.tpl.html',
      controller: 'AddKpiCtrl'
    });

    kpiModal.result.then(function (kpiToAdd) {
      KpiService.createKpi(kpiToAdd).then(function(kpi) {
        $scope.kpiList.push(kpi);
      });
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.deleteKpi = function(kpi) {

    KpiService.deleteKpi(kpi).then(function() {
      var index = _.indexOf($scope.kpiList, kpi);
      if(index !== -1) {
        $scope.kpiList.splice(index, 1);
      }
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
      // add the kpi settings and module spec kpi list in process
      ProcessService.updateKpiSettings(configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  // TODO: this is an indicator whether the KPI is ok or not 
  $scope.kpiIsConfigured = function(kpi) {
    return (kpi.excellent || kpi.excellent === 0) && (kpi.bad || kpi.bad === 0);
  };

}]);

