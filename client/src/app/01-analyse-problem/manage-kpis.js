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
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'ManageKpisCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', 'socket', 'ModuleService', function ManageKpisCtrl( $scope, KpiService, ProcessService, $modal, socket, ModuleService) {

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

  $scope.addKpi = function() {

    var kpiModal = $modal.open({
      templateUrl: '01-analyse-problem/add-kpi.tpl.html',
      controller: 'AddKpiCtrl'
    });

    kpiModal.result.then(function (kpiToAdd) {
      console.log(kpiToAdd);
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
      kpi.inputs = configuredKpi.inputs;
      kpi.selectedModule = configuredKpi.selectedModule;
      console.log(configuredKpi);
      if(!ModuleService.extendModuleData(kpi.selectedModule)) {
        // TODO: this does not work, if user deselects a module is does not disappear
        kpi.selectedModule = {id: null}; // module was disabled
      }
      ProcessService.addLog({label: 'Configured KPI ' + kpi.name});
      ProcessService.saveCurrentProcess();
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.kpiIsManaged = function(kpi) {
    return false;
  };

}]);

