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

.controller( 'AssessVariantsController', ['$scope', '$timeout', 'socket', '$stateParams', 'variants', 'ModuleService', 'VariantService', '$modal', 'KpiService', function AssessVariantsController( $scope, $timeout, socket, $stateParams, variants, ModuleService, VariantService, $modal, KpiService ) {

  var variantId = $stateParams.variantId;

  var currentVariant;
  var asIsVariant;
  $scope.otherVariants = [];
  
  _.each(variants, function(variant) {
    if(variant._id === variantId) {
      currentVariant = variant;
      $scope.currentVariantName = currentVariant.name;
    } else if(variant.type === 'as-is') {
      asIsVariant = variant;
    } else if(variant.type === 'to-be') {
      toBeVariant = variant;
    } else {
      $scope.otherVariants.push(variant);
    }
  });

  // TODO: check if new kpis are added
  if(currentVariant && asIsVariant.kpiList.length !== currentVariant.kpiList.length) {
    VariantService.addOrRemoveKpis(asIsVariant, currentVariant);
    VariantService.saveVariant(currentVariant).then(function(savedVariant) {
      $scope.currentVariant = KpiService.initOutputs(savedVariant, asIsVariant);
    });
  } else if(currentVariant) {
    $scope.currentVariant = KpiService.initOutputs(currentVariant, asIsVariant);
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
    } else if(kpi.status === 'failed') {
      return 'danger';
    } else {
      // default
      return 'info';
    }
  };

  // TODO: when pushing calculate button on kpi, set status to calculating and save outputs status without outputs from modules.. how?
  $scope.calculateKpi = function(kpi) {
    kpi.status = 'initializing';
    kpi.loading = true;

    socket.emit('startModule', {
      variantId: currentVariant._id, 
      asIsVariantId: asIsVariant._id,
      kpiId: kpi.alias, // modules use kpiId instead of alias
      moduleId: kpi.moduleId,
      status: kpi.status
    });
  };

  // listen on any module that was started, for updating loading status
  socket.on('startModule', function(module) {
      console.log('start module', module);
      
      var found = _.find(currentVariant.kpiList, function(kpi) {
        return kpi.moduleId === module.moduleId && kpi.alias === module.kpiId;
      });
      if(found) {
        found.status = module.status;
        if(found.status !== 'processing') {
          found.loading = false;
        }
      } else {
        console.log('This module is not used. Why would this happen?');
      }
  });

  socket.on('moduleResult', function(module) {
    console.log('module result', module);

    var kpi = _.find(currentVariant.kpiList, function(k) {
      return k.alias === module.kpiId;
    });
    if(kpi) {
      // this cancels/overrides any manual output
      kpi.manual = false;
      // if status changed/exists, otherwise keep old status
      kpi.status = module.status || kpi.status;
      if(kpi.status !== 'processing') {
        kpi.loading = false;
      }

      kpi.outputs = module.outputs;
      // for updating manual property only..
      VariantService.updateKpi(currentVariant, kpi);

    } else {
      console.log('Dashboard recieved module result but couldnt find the kpi');
    }

  });

  $scope.stopCalculation = function(kpi) {
    kpi.status = 'unprocessed';
    kpi.loading = false;

    ModuleService.updateModuleOutputStatus(currentVariant._id, kpi.moduleId, kpi.alias, kpi.status);

    // send message to module?
  };

  $scope.setScore = function(kpi) {

    var kpiModal, templateUrl, controller, asIsKpi;

    if(kpi.qualitative) {
      templateUrl = 'qualitative-kpi-input/qualitative-kpi-input.tpl.html';
      controller = 'QualitativeKpiInputCtrl';
    } else {
      asIsKpi = _.find(asIsVariant.kpiList, function(k) { return k.alias === kpi.alias;});
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
        VariantService.updateKpi(currentVariant, configuredKpi);
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
          currentVariant: function() {
            return currentVariant;
          }
        }
      });

      moduleInputModal.result.then(function (moduleInput) {

        ModuleService.saveModuleInput(moduleInput.variantId, moduleInput);
                
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });

    };

  $scope.disable = function(kpi, state) {
    kpi.disabled = state;
    VariantService.updateKpi(currentVariant, kpi);
  };

}]);

