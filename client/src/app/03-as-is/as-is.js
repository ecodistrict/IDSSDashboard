angular.module( 'idss-dashboard.as-is', [
  // 'idss-dashboard.as-is.map',
  // 'idss-dashboard.as-is.details'
])

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

.controller( 'AsIsController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'variants', 'ModuleService', '$modal', 'KpiService', 'VariantService', function AsIsController( $scope, $timeout, $sce, socket, $state, variants, ModuleService, $modal, KpiService, VariantService ) {

  // TODO: there are different type of outputs; kpi value, map outputs, charts, lists. In different tabs. New structure of outputs needed? 

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  var currentVariant = asIsVariant;
  $scope.kpiMapOutputs = [];
  $scope.currentVariant = KpiService.initOutputs(currentVariant, asIsVariant);

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
      // this cancels/overrides any manual output
      kpi.manual = false;
      // if status changed/exists, otherwise keep old status
      kpi.status = module.status || kpi.status;

      // // TODO: refactor this to prepareKpiData above, bad and excellent is the issue
      // _.each(module.outputs, function(o) {
      //   o.alias = kpi.alias;
      //   o.kpiName = kpi.kpiName;
      //   o.kpiBad = kpi.kpiBad;
      //   o.kpiExcellent = kpi.kpiExcellent;
      //   o.kpiUnit = kpi.kpiUnit;
      //   o.moduleId = kpi.moduleId;
      //   if(o.type === 'geojson') {
      //     // TODO: update any existing map output, use id?
      //     $scope.kpiMapOutputs.push(o);
      //   }
      // });

      kpi.outputs = module.outputs;
      // for updating manual property only..
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

    var kpiModal, templateUrl, controller, 
        asIsKpi = _.find(asIsVariant.kpiList, function(k) { return k.alias === kpi.alias;});

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
        // update kpi in variant
        VariantService.updateKpi(currentVariant, configuredKpi);
        // trigger update to kpi in scope
        kpi.outputs = configuredKpi.outputs;
        kpi = configuredKpi;
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

  $scope.selectMap = function() {
    $scope.trig = true;
  };


}]);

