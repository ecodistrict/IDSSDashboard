angular.module( 'idss-dashboard.assess-variants', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'assess-variants', {
    url: '/assess-variants/:variantId',
    views: {
      "main": {
        controller: 'AssessVariantsController',
        templateUrl: '06-assess-variants/assess-variants.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Assess variants',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    },
    resolve:{
      currentProcess: ['ProcessService', function(ProcessService) {
        return ProcessService.loadCurrentProcess().then(function(currentProcess) {
          return currentProcess;
        });
      }],
      variants: ['VariantService', function(VariantService) {
        var v = VariantService.getVariants();
        if(v) {
          return v;
        } else {
          return VariantService.loadVariants();
        }
      }]
    }
  });
}])

.controller( 'AssessVariantsController', ['$scope', '$timeout', 'socket', '$stateParams', 'variants', 'currentProcess', 'ModuleService', 'VariantService', '$modal', 'KpiService', '$state', function AssessVariantsController( $scope, $timeout, socket, $stateParams, variants, currentProcess, ModuleService, VariantService, $modal, KpiService, $state ) {

  var variantId = $stateParams.variantId;
  var currentVariant;
  var asIsVariant;

  $scope.currentProcess = currentProcess;
  $scope.otherVariants = [];
  
  _.each(variants, function(variant) {
    if(variant._id === variantId) {
      $scope.currentVariant = currentVariant = variant;
      $scope.currentVariantName = currentVariant.name;
    } else if(variant.type === 'as-is') {
      asIsVariant = variant;
    } else if(variant.type === 'to-be') {
      toBeVariant = variant;
    } else {
      $scope.otherVariants.push(variant);
    }
  });

  if(currentVariant) {
    _.each(currentProcess.kpiList, function(kpi) {
      KpiService.removeExtendedData(kpi); // in case data is already extended 
      kpi.loading = true;
      kpi.status = 'initializing';
      KpiService.getKpiRecord(currentVariant._id, kpi.alias).then(function(record) {
          angular.extend(kpi, record); 
          if(kpi.status === 'initializing' || kpi.status === 'processing') {
            kpi.loading = true;
          } else {
            kpi.loading = false;
          }
      });
     
    });
  }

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
    $state.transitionTo('kpi', {variantId: currentVariant._id, kpiAlias: kpi.alias, back: 'assess-variants/' + currentVariant._id});
  };

}]);

