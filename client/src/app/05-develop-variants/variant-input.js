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
      authorizedRoles: ['Facilitator']
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

  var initOutputs = function(variant) {
    _.each(variant.kpiList, function(kpi) {
      var asIsKpi = _.find(asIsVariant.kpiList, function(k) { return k.alias === kpi.alias;});
      kpi.asIsKpi = asIsKpi;
      kpi.kpiBad = KpiService.getBadKpiValue(asIsKpi.inputSpecification);
      kpi.kpiExcellent = KpiService.getExcellentKpiValue(asIsKpi.inputSpecification);
      kpi.kpiUnit = kpi.unit || 'score';
      kpi.kpiName = kpi.name;
      kpi.status = 'loading';
      kpi.outputs = null; // manual output can exist (saved or cached), to avoid extra rendering wait for init of outputs below
      kpi.loading = true;
      // this adds properties to children outputs
      var prepareKpiData = function(o) {
          o.alias = kpi.alias;
          o.kpiName = kpi.name;
          o.kpiBad = kpi.kpiBad;
          o.kpiExcellent = kpi.kpiExcellent;
          o.kpiUnit = kpi.kpiUnit;
          o.moduleId = kpi.selectedModule.id;
      };
      if(kpi.qualitative) {
        kpi.moduleName = 'Qualitative KPI';
        // returns null if score was not given to this kpi
        kpi.outputs = KpiService.generateQualitativeKpiOutput(kpi.inputSpecification.kpiScores.inputs);
        kpi.status = kpi.outputs ? 'success' : 'unprocessed';
        kpi.loading = false;

      } else {
        // try to fetch a module output of a module has been selected
        // if manual has been set this is prioritized, a kpi must be recalculated to override this
        if(kpi.selectedModule.id && !kpi.manual) {
          kpi.moduleName = kpi.selectedModule.name;
          kpi.moduleId = kpi.selectedModule.id;
          ModuleService.getModuleOutput(variant._id, kpi.selectedModule.id, kpi.alias).then(function(output) {
              kpi.status =  output.status; 
              if(kpi.status === 'initializing' || kpi.status === 'processing') {
                kpi.loading = true;
              } else {
                kpi.loading = false;
              }

              // set the kpi values on children outputs
              _.each(output.outputs, function(o) {
                prepareKpiData(o);
                if(o.type === 'geojson') {
                  $scope.kpiMapOutputs.push(o);
                } 
              });

              kpi.outputs = output.outputs; // listen on this to trigger rendering
          });
        } else {
          kpi.moduleName = kpi.selectedModule.name || 'Manual input (no module selected)';
          // try to set any manual given values, null if not found
          kpi.outputs = KpiService.generateQuantitativeKpiOutput(kpi.inputSpecification.kpiValueInputGroup.inputs.kpiValue);
          kpi.status = kpi.outputs ? 'success' : 'unprocessed';
          kpi.loading = false;
        }
      }
    });
    $scope.currentVariant = variant;
  };

  // TODO: check if new kpis are added
  if(asIsVariant.kpiList.length !== currentVariant.kpiList.length) {
    VariantService.addOrRemoveKpis(asIsVariant, currentVariant);
    VariantService.saveVariant(currentVariant).then(function(savedVariant) {
      initOutputs(savedVariant);
    });
  } else {
    initOutputs(currentVariant);
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

    socket.emit('startModel', {
      variantId: currentVariant._id, 
      asIsVariantId: asIsVariant._id,
      kpiId: kpi.alias, // modules use kpiId instead of alias
      moduleId: kpi.moduleId,
      status: kpi.status
    });
  };

  // listen on any model that was started, for updating loading status
  socket.on('startModel', function(module) {
      console.log('start model', module);
      
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

  socket.on('modelResult', function(module) {
    console.log('model result', module);

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
      console.log('Dashboard recieved model result but couldnt find the kpi');
    }

  });

  $scope.stopCalculation = function(kpi) {
    kpi.status = 'unprocessed';
    kpi.loading = false;

    ModuleService.updateModuleOutputStatus(currentVariant._id, kpi.moduleId, kpi.alias, kpi.status);

    // send message to model?
  };

  $scope.setScore = function(kpi) {

    var kpiModal, templateUrl, controller;

    if(kpi.qualitative) {
      templateUrl = 'qualitative-kpi-input/qualitative-kpi-input.tpl.html';
      controller = 'QualitativeKpiInputCtrl';
    } else {
      KpiService.generateManualInput(kpi.asIsKpi, kpi);
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

}]);

