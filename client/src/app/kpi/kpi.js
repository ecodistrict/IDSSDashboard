angular.module( 'idss-dashboard.kpi', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'kpi', {
    url: '/kpi?variantId&kpiAlias&back&userId&stakeholder',
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
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(currentUser) {
          return currentUser;
        });
      }],
      currentProcess: ['ProcessService', function(ProcessService) {
        return ProcessService.loadCurrentProcess().then(function(currentProcess) {
          return currentProcess;
        });
      }],
      kpiRecord: ['KpiService', '$stateParams', function(KpiService, $stateParams) {
        return KpiService.getKpiRecord($stateParams.variantId, $stateParams.kpiAlias, $stateParams.userId);
      }],
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }]
    }
  });
}])

.controller( 'KpiController', ['$scope', 'socket', '$stateParams', '$state', 'kpiRecord', 'currentProcess', 'currentUser', 'ModuleService', '$modal', 'KpiService', 'VariantService', 'ProcessService', 'variants', function KpiController( $scope, socket, $stateParams, $state, kpiRecord, currentProcess, currentUser, ModuleService, $modal, KpiService, VariantService, ProcessService, variants ) {

  var kpi = _.find(currentProcess.kpiList, function(k) {return k.kpiAlias === $stateParams.kpiAlias;});
  KpiService.removeExtendedData(kpi); // possible old extended data from another view
  $scope.currentUser = currentUser; // current user is loaded again.. otherwise the user is not yet loaded when reloading page.. 
  $stateParams.back = $stateParams.back || 'compare-variants';
  var backState = $stateParams.back.split('/')[0];
  var selectedModule;
  if(kpi && kpiRecord) {
    // extend data
    angular.extend(kpi, kpiRecord);
  }
  kpi.processId = currentProcess._id;
  if(kpi.status === 'initializing' || kpi.status === 'processing') {
    kpi.loading = true;
  }
  $scope.stakeholderName = $stateParams.stakeholder || $scope.currentUser.name || $scope.currentUser.fname;
  // if selected module is already loaded in dashboard
  if(kpi.selectedModuleId) {
    selectedModule = ModuleService.getModule(kpi.selectedModuleId);
    if(selectedModule) {
      kpi.selectedModuleName = selectedModule.name;
      kpi.selectedModuleDescription = selectedModule.description;
    }
  }

  $scope.kpi = kpi;

  var currentVariant = $scope.currentVariant = _.find(variants, function(v) {return v._id === $stateParams.variantId;});
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
      asIsVariantId: asIsVariant._id, // as is is needed if new alternative - if there is no input, take from as is
      kpiAlias: kpi.kpiAlias, 
      moduleId: kpi.selectedModuleId, 
      status: kpi.status,
      userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
      processId: currentProcess._id
    });
  };

  // listen on any module that was started, for updating loading status
  socket.on('startModule', function(module) {
    console.log('start module', module);
      
    kpi.status = module.status;
    if(kpi.status !== 'processing') {
      kpi.loading = false;
    }
  });

  // set a new output on a kpi when output data returns
  socket.on('moduleResult', function(module) {
    console.log('module result', module);

    // this cancels/overrides any manual output
    kpi.manual = false;
    // if status changed/exists, otherwise keep old status
    kpi.status = module.status || kpi.status;
      
    if(kpi.status !== 'processing') {
      kpi.loading = false;
    }

    kpi.value = module.value;

  });

  // if this is start page listen directly on socket to update module data
  socket.on('getModules', function(moduleData) {
    if(kpi.selectedModuleId === moduleData.moduleId) {
      kpi.selectedModuleName = moduleData.name;
      kpi.selectedModuleDescription = moduleData.description;
    }
  });

  $scope.stopCalculation = function(kpi) {
    kpi.status = 'unprocessed';
    kpi.loading = false;

    KpiService.updateKpiRecord(kpi); 

    //ModuleService.updateModuleOutputStatus(kpi.variantId, kpi.moduleId, kpi.kpiAlias, kpi.status);

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
        size: 'sm',
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
          currentVariant: function() {
            return currentVariant;
          },
          asIsVariant: function() {
            return asIsVariant;
          },
          currentProcess: function() {
            return currentProcess;
          }
        }
      });

      moduleInputModal.result.then(function (moduleInput) {
        if(moduleInput) {
          kpi.inputs = moduleInput.inputs;
          moduleInput.userId = $scope.currentUser._id; // only facilitator should be able to do this
          moduleInput.status = 'unprocessed'; // input has changed
          console.log(moduleInput);
          kpi.status = 'unprocessed'; // update GUI
          ModuleService.saveModuleInput(moduleInput);
        }
                
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
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

  $scope.disable = function(kpi, state) {
    kpi.disabled = state;
    KpiService.updateKpiRecord(kpi);
  };

  $scope.goBack = function() {
    $state.transitionTo(backState, {variantId: currentVariant._id});
  };

}]);

