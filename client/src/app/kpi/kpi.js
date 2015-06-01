angular.module( 'idss-dashboard.kpi', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'kpi', {
    url: '/kpi?variantId&kpiAlias&back',
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
      currentProcess: ['ProcessService', function(ProcessService) {
        return ProcessService.loadCurrentProcess().then(function(currentProcess) {
          return currentProcess;
        });
      }],
      kpiRecord: ['KpiService', '$stateParams', function(KpiService, $stateParams) {
        return KpiService.getKpiRecord($stateParams.variantId, $stateParams.kpiAlias);
      }],
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }]
    }
  });
}])

.controller( 'KpiController', ['$scope', 'socket', '$stateParams', 'kpiRecord', 'currentProcess', 'ModuleService', '$modal', 'KpiService', 'VariantService', 'ProcessService', 'variants', function KpiController( $scope, socket, $stateParams, kpiRecord, currentProcess, ModuleService, $modal, KpiService, VariantService, ProcessService, variants ) {

  var kpi = _.find(currentProcess.kpiList, function(k) {return k.alias === kpiRecord.alias;});
  angular.extend(kpi, kpiRecord);

  kpi.selectedModule = kpi.selectedModule || {};

  $scope.kpi = kpi;
  $scope.back = $stateParams.back || 'compare-variants';

  $scope.currentVariant = _.find(variants, function(v) {return v._id === $stateParams.variantId;});
  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

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

  $scope.stopCalculation = function(kpi) {
    kpi.status = 'unprocessed';
    kpi.loading = false;

    //ModuleService.updateModuleOutputStatus(kpi.variantId, kpi.moduleId, kpi.alias, kpi.status);

    // send message to module?
  };

  $scope.setScore = function(kpi) {

    var kpiModal, templateUrl, controller;

    if(kpi.qualitative) {
      templateUrl = 'qualitative-kpi-input/qualitative-kpi-input.tpl.html';
      controller = 'QualitativeKpiInputCtrl';
    } else {
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
        configuredKpi.manual = kpi.manual = true;
        configuredKpi.status = kpi.status = 'success';
        configuredKpi.loading = kpi.loading = false;
        kpi.value = configuredKpi.value;
        
        KpiService.updateKpiRecord(configuredKpi);
        
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
      // add the kpi settings and module spec kpi list in process
      ProcessService.updateKpiSettings(configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.disable = function(kpi, state) {
    kpi.disabled = state;
    KpiService.updateKpiRecord(kpi);
  };

}]);

