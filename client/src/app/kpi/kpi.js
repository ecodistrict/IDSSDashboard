angular.module( 'idss-dashboard.kpi', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'kpi', {
    url: '/kpi/:variantId/:kpiAlias',
    views: {
      "main": {
        controller: 'KpiController',
        templateUrl: 'kpi/kpi.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Kpi settings',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    },
    resolve:{
      variant: ['VariantService', '$stateParams', function(VariantService, $stateParams) {
        console.log($stateParams);
        return VariantService.loadVariant($stateParams.variantId);
      }]
    }
  });
}])

.controller( 'KpiController', ['$scope', 'socket', '$stateParams', 'variant', 'ModuleService', '$modal', 'KpiService', 'VariantService', function KpiController( $scope, socket, $stateParams, variant, ModuleService, $modal, KpiService, VariantService ) {

  $scope.kpi = _.find(variant.kpiList, function(kpi) {return kpi.alias === $stateParams.kpiAlias;});
  console.log(variant);

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

  $scope.stopCalculation = function(kpi) {
    kpi.status = 'unprocessed';
    kpi.loading = false;

    ModuleService.updateModuleOutputStatus(variant._id, kpi.moduleId, kpi.alias, kpi.status);

    // send message to module?
  };

  $scope.setScore = function(kpi) {

    var kpiModal, templateUrl, controller, 
        asIsKpi = _.find(variant.kpiList, function(k) { return k.alias === kpi.alias;});

    if(kpi.qualitative) {
      KpiService.copyQualitativeKpiInputFromSettings(kpi, asIsKpi);
      templateUrl = 'qualitative-kpi-input/qualitative-kpi-input.tpl.html';
      controller = 'QualitativeKpiInputCtrl';
    } else {
      KpiService.generateManualInput(asIsKpi, kpi);
      templateUrl = 'quantitative-kpi-input/quantitative-kpi-input.tpl.html';
      controller = 'QuantitativeKpiInputCtrl';
    }

    kpiModal = $modal.open({
        templateUrl: templateUrl,
        controller: controller,
        resolve: {
          kpi: function() {
            return kpi;
          }
        }
      });

      kpiModal.result.then(function (configuredKpi) {
        configuredKpi.manual = true;
        configuredKpi.status = 'success';
        configuredKpi.loading = false;
        // fix this, the copy vs the original - both need new data
        kpi.manual = true;
        kpi.status = 'success';
        kpi.loading = false;
        // update kpi in variant
        VariantService.updateKpi(variant, configuredKpi);
        // trigger update to kpi in scope
        kpi.outputs = configuredKpi.outputs;
        
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });

    };

  $scope.setModuleInput = function(kpi) {
    
    moduleInputModal = $modal.open({
        templateUrl: '02-collect-data/module-input.tpl.html',
        controller: 'ModuleInputController',
        resolve: {
          kpi: function() {
            return kpi;
          },
          variant: function() {
            return variant;
          }
        }
      });

      moduleInputModal.result.then(function (moduleInput) {

        ModuleService.saveModuleInput(moduleInput.variantId, moduleInput);
                
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
      // add the kpi settings and module spec to as is variant
      VariantService.updateKpi(variant, configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.disable = function(kpi, state) {
    kpi.disabled = state;
    VariantService.updateKpi(variant, kpi);
  };

}]);

