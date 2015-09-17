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
      // add copy of this KPI to the process
      useKpi = angular.copy(useKpi);
      // make sure that the user id is the current user not the one that created the kpi
      useKpi.userId = process.userId;
      ProcessService.addKpi(useKpi); 
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.useKpiQuick = function(useKpi) {
    // add copy of this KPI to as is variant
      ProcessService.addKpi(angular.copy(useKpi));
  };

  // Add KPI to KPI repository
  $scope.addKpi = function(kpiToEdit) {

    var config = {
      templateUrl: '01-analyse-problem/add-kpi.tpl.html',
      controller: 'AddKpiCtrl',
    };

    if(kpiToEdit) {
      config.resolve = {
        kpi: function() {
          return kpiToEdit;
        }
      };
    } else {
      config.resolve = {
        kpi: true // have to give the kpi truthy to the dialog...
      };
    }

    var kpiModal = $modal.open(config);

    kpiModal.result.then(function (kpiToAdd) {
      if(kpiToEdit) {
        KpiService.updateKpi(kpiToAdd);

        // update properties on original since edit is on a copy
        kpiToEdit.name = kpiToAdd.name;
        kpiToEdit.description = kpiToAdd.description;
        kpiToEdit.qualitative = kpiToAdd.qualitative;
        kpiToEdit.unit = kpiToAdd.unit;
        kpiToEdit.official = kpiToAdd.official;

        if(kpiToAdd.updateSettings && kpiToAdd.updateSettings.updateForThisProcess) {
          ProcessService.updateSelectedKpi(kpiToEdit);
        }
      } else {
        KpiService.createKpi(kpiToAdd).then(function(kpi) {
          $scope.kpiList.push(kpi);
        });
      }
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
      size: 'sm',
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

