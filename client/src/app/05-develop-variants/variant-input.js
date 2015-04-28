angular.module( 'idss-dashboard.develop-variants.variant-input', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'variant-input', {
    url: '/variant-input/:variantId',
    views: {
      "main": {
        controller: 'VariantInputController',
        templateUrl: '05-develop-variants/variant-input.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Variant input',
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

.controller( 'VariantInputController', ['$scope', '$timeout', 'socket', '$stateParams', 'variants', 'ModuleService', 'VariantService', '$modal', 'KpiService', function VariantInputController( $scope, $timeout, socket, $stateParams, variants, ModuleService, VariantService, $modal, KpiService ) {

  var variantId = $stateParams.variantId;

  if(!variantId) {
    console.log('missing params');
    return;
  }

  var currentVariant = _.find(variants, function(v) {return v._id === variantId;});
  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  $scope.currentVariantName = currentVariant.name;
  $scope.kpiMapOutputs = [];

  // TODO: check if new kpis are added
  if(asIsVariant.kpiList.length !== currentVariant.kpiList.length) {
    VariantService.addOrRemoveKpis(asIsVariant, currentVariant);
    VariantService.saveVariant(currentVariant).then(function(savedVariant) {
      $scope.currentVariant = KpiService.initOutputs(savedVariant, asIsVariant);
    });
  } else {
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
      kpi.manual = false;
      kpi.status = module.status;
      // TODO: refactor this to prepareKpiData above, bad and excellent is the issue
      _.each(module.outputs, function(o) {
        o.alias = kpi.alias;
        o.kpiName = kpi.kpiName;
        o.kpiBad = kpi.kpiBad;
        o.kpiExcellent = kpi.kpiExcellent;
        o.kpiUnit = kpi.kpiUnit;
        o.moduleId = kpi.moduleId;
        if(o.type === 'geojson') {
          // TODO: update any existing map output, use id?
          $scope.kpiMapOutputs.push(o);
        }
      });

      kpi.outputs = module.outputs;
      // for updating manual property
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

