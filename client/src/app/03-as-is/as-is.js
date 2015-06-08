angular.module( 'idss-dashboard.as-is', [])

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
      authorizedRoles: ['Facilitator', 'Stakeholder']
    },
    resolve:{
      currentProcess: ['ProcessService', function(ProcessService) {
        return ProcessService.loadCurrentProcess().then(function(currentProcess) {
          return currentProcess;
        });
      }],
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }]
    }
  });
}])

.controller( 'AsIsController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'ModuleService', '$modal', 'KpiService', 'VariantService', 'currentProcess', 'variants', function AsIsController( $scope, $timeout, $sce, socket, $state, ModuleService, $modal, KpiService, VariantService, currentProcess, variants ) {

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  $scope.currentProcess = currentProcess;

  _.each(currentProcess.kpiList, function(kpi) {
    KpiService.removeExtendedData(kpi); // in case data is already extended 
    kpi.loading = true;
    kpi.status = 'initializing';
    KpiService.getKpiRecord(asIsVariant._id, kpi.kpiAlias).then(function(record) {
        angular.extend(kpi, record); 
        if(kpi.status === 'initializing' || kpi.status === 'processing') {
          kpi.loading = true;
        } else {
          kpi.loading = false;
        }
    });
   
  });

  $scope.getStatus = function(kpi) {
    if(kpi.status === 'unprocessed') {
      return 'warning';
    } else if(kpi.status === 'initializing') {
      return 'primary';
    } else if(kpi.status === 'processing') {
      return 'info';
    } else if(kpi.status === 'success') {
      return 'success';
    } 
  };

  $scope.goToKpiPage = function(kpi) {
    $state.transitionTo('kpi', {variantId: asIsVariant._id, kpiAlias: kpi.kpiAlias, back: 'as-is'});
  };

}]);

