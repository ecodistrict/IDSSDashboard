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
  _.each(currentProcess.kpiList, function(kpi) {
    kpi.loading = true;
    kpi.status = 'initializing';
    KpiService.getKpiRecord(asIsVariant._id, kpi.alias).then(function(record) {
        angular.extend(kpi, record); 
        if(kpi.status === 'initializing' || kpi.status === 'processing') {
          kpi.loading = true;
        } else {
          kpi.loading = false;
        }
    });
   
  });
  // var currentVariant = asIsVariant;
  // $scope.kpiMapOutputs = [];
  // $scope.currentVariant = KpiService.initOutputs(currentVariant, asIsVariant, $scope.kpiMapOutputs);

  // // remove this - send kpi to output directive instead
  // var setKpiDataToOutput = function(outputs, kpi) {
  //     _.each(outputs, function(o) {
  //       o.alias = kpi.alias;
  //       o.kpiName = kpi.name;
  //       o.kpiBad = kpi.bad;
  //       o.kpiExcellent = kpi.excellent;
  //       o.kpiUnit = kpi.unit;
  //       o.moduleId = kpi.moduleId;
  //       if(o.type === 'geojson') {
  //         // TODO: update any existing map output, use id?
  //         $scope.kpiMapOutputs.push(o);
  //       }
  //     });
  // };

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
    $state.transitionTo('kpi', {variantId: asIsVariant._id, kpiAlias: kpi.alias});
  };

  // // TODO: when pushing calculate button on kpi, set status to calculating and save outputs status without outputs from modules.. how?
  // $scope.calculateKpi = function(kpi) {
  //   kpi.status = 'initializing';
  //   kpi.loading = true;

  //   socket.emit('startModule', {
  //     variantId: currentVariant._id, 
  //     asIsVariantId: asIsVariant._id,
  //     kpiId: kpi.alias, // modules use kpiId instead of alias
  //     moduleId: kpi.moduleId,
  //     status: kpi.status
  //   });
  // };

  // // listen on any module that was started, for updating loading status
  // socket.on('startModule', function(module) {
  //     console.log('start module', module);
      
  //     var found = _.find(currentVariant.kpiList, function(kpi) {
  //       return kpi.moduleId === module.moduleId && kpi.alias === module.kpiId;
  //     });
  //     if(found) {
  //       found.status = module.status;
  //       if(found.status !== 'processing') {
  //         found.loading = false;
  //       }
  //     } else {
  //       console.log('This module is not used. Why would this happen?');
  //     }
  // });

  // // set a new output on a kpi when output data returns
  // socket.on('moduleResult', function(module) {
  //   console.log('module result', module);

  //   var kpi = _.find(currentVariant.kpiList, function(k) {
  //     return k.alias === module.kpiId;
  //   });
  //   if(kpi) {
  //     // this cancels/overrides any manual output
  //     kpi.manual = false;
  //     // if status changed/exists, otherwise keep old status
  //     kpi.status = module.status || kpi.status;
  //     if(kpi.status !== 'processing') {
  //       kpi.loading = false;
  //     }

  //     console.log(kpi);

  //     setKpiDataToOutput(module.outputs, kpi);

  //     kpi.outputs = module.outputs;
  //     // for updating manual property only..
  //     VariantService.updateKpi(currentVariant, kpi);

  //   } else {
  //     console.log('Dashboard recieved module result but couldnt find the kpi');
  //   }

  // });

  // $scope.stopCalculation = function(kpi) {
  //   kpi.status = 'unprocessed';
  //   kpi.loading = false;

  //   ModuleService.updateModuleOutputStatus(currentVariant._id, kpi.moduleId, kpi.alias, kpi.status);

  //   // send message to module?
  // };

  // $scope.setScore = function(kpi) {

  //   var kpiModal, templateUrl, controller, 
  //       asIsKpi = _.find(asIsVariant.kpiList, function(k) { return k.alias === kpi.alias;});

  //   if(kpi.qualitative) {
  //     KpiService.copyQualitativeKpiInputFromSettings(kpi, asIsKpi);
  //     templateUrl = 'qualitative-kpi-input/qualitative-kpi-input.tpl.html';
  //     controller = 'QualitativeKpiInputCtrl';
  //   } else {
  //     KpiService.generateManualInput(asIsKpi, kpi);
  //     templateUrl = 'quantitative-kpi-input/quantitative-kpi-input.tpl.html';
  //     controller = 'QuantitativeKpiInputCtrl';
  //   }

  //   kpiModal = $modal.open({
  //       templateUrl: templateUrl,
  //       controller: controller,
  //       resolve: {
  //         kpi: function() {
  //           return kpi;
  //         }
  //       }
  //     });

  //     kpiModal.result.then(function (configuredKpi) {
  //       configuredKpi.manual = true;
  //       configuredKpi.status = 'success';
  //       configuredKpi.loading = false;
  //       // fix this, the copy vs the original - both need new data
  //       kpi.manual = true;
  //       kpi.status = 'success';
  //       kpi.loading = false;
  //       // update kpi in variant
  //       VariantService.updateKpi(currentVariant, configuredKpi);
  //       // trigger update to kpi in scope
  //       kpi.outputs = configuredKpi.outputs;
        
  //     }, function () {
  //       console.log('Modal dismissed at: ' + new Date());
  //     });

  //   };

  // $scope.setModuleInput = function(kpi) {
    
  //   moduleInputModal = $modal.open({
  //       templateUrl: '02-collect-data/module-input.tpl.html',
  //       controller: 'ModuleInputController',
  //       resolve: {
  //         kpi: function() {
  //           return kpi;
  //         },
  //         currentVariant: function() {
  //           return currentVariant;
  //         }
  //       }
  //     });

  //     moduleInputModal.result.then(function (moduleInput) {

  //       ModuleService.saveModuleInput(moduleInput.variantId, moduleInput);
                
  //     }, function () {
  //       console.log('Modal dismissed at: ' + new Date());
  //     });

  //   };

  // $scope.selectMap = function() {
  //   $scope.trig = true;
  // };

  // $scope.disable = function(kpi, state) {
  //   kpi.disabled = state;
  //   VariantService.updateKpi(currentVariant, kpi);
  // };

}]);

