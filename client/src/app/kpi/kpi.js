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
      activeCase: ['CaseService', function(CaseService) {
        return CaseService.loadActiveCase().then(function(activeCase) {
          return activeCase;
        });
      }],
      // kpiRecord: ['KpiService', '$stateParams', function(KpiService, $stateParams) {
      //   return KpiService.getKpiRecord($stateParams.variantId, $stateParams.kpiAlias, $stateParams.userId);
      // }],
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }]
    }
  });
}])

.controller( 'KpiController', ['$scope', '$window', '$timeout', 'socket', '$stateParams', '$state', 'activeCase', 'currentUser', 'ModuleService', '$modal', 'KpiService', 'VariantService', 'CaseService', 'variants', 
  function KpiController( $scope, $window, $timeout, socket, $stateParams, $state, activeCase, currentUser, ModuleService, $modal, KpiService, VariantService, CaseService, variants ) {

  socket.forward('startModule', $scope);
  socket.forward('getModules', $scope);

  var kpi = _.find(activeCase.kpiList, function(k) {return k.kpiAlias === $stateParams.kpiAlias;});
  KpiService.removeExtendedData(kpi); // possible old extended data from another view
  
  $scope.currentUser = currentUser; // current user is loaded again.. otherwise the user is not yet loaded when reloading page.. 
  $stateParams.back = $stateParams.back || 'compare-variants';
  
  var backState = decodeURIComponent($stateParams.back).split('/')[0];
  var selectedModule;
  
  kpi.caseId = activeCase._id;

  $scope.stakeholderName = $stateParams.stakeholder || $scope.currentUser.name || $scope.currentUser.fname;
  // if selected module is already loaded in dashboard
  console.log(kpi);
  if(kpi.selectedModuleId) {
    selectedModule = ModuleService.getModule(kpi.selectedModuleId);
    console.log(selectedModule);
    if(selectedModule) {
      kpi.selectedModuleName = selectedModule.name;
      kpi.selectedModuleDescription = selectedModule.description;
      kpi.connectedModuleUrl = selectedModule.connectedModuleUrl;
    }
  }

  var currentVariant = $scope.currentVariant = _.find(variants, function(v) {return v._id === $stateParams.variantId;});
  // if this is as is kpi
  if(!currentVariant) {
    kpi.value = activeCase.kpiValues[kpi.kpiAlias];
    currentVariant = {
      name: 'As is'
    }; 
    // set any disabled
    kpi.disabled = activeCase.kpiDisabled[kpi.kpiAlias];
  } else {
    currentVariant.kpiValues = currentVariant.kpiValues || {};
    currentVariant.kpiDisabled = currentVariant.kpiDisabled || {};
    kpi.value = currentVariant.kpiValues[kpi.kpiAlias];
    // set any disabled
    kpi.disabled = currentVariant.kpiDisabled[kpi.kpiAlias];
  }
  // set status
  if(kpi.value || kpi.value === 0) {
    kpi.status = 'success';
  } else {
    kpi.status = 'unprocessed';
  }

  $scope.currentVariant = currentVariant;

  $scope.kpi = kpi;

  // socket.emit('getOverallKpiResult', {
  //   kpiId: kpi.kpiAlias,
  //   userId: currentUser._id,
  //   caseId: activeCase._id,
  //   moduleId: kpi.selectedModuleId,
  //   variantId: currentVariant._id
  // });

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
      kpiAlias: kpi.kpiAlias, 
      moduleId: kpi.selectedModuleId, 
      status: kpi.status,
      userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
      caseId: activeCase._id
    });
  };

  // $timeout(function() {
  //     kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
  //     kpi.loading = false;
  //   }, 6000);

  // not working since introduction of data module, now only looks like it stopped calculation
  $scope.stopCalculation = function(kpi) {
    kpi.status = 'unprocessed';
    kpi.loading = false;

    //KpiService.updateKpiRecord(kpi); 

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

        console.log('configuredKpi');
        console.log(configuredKpi);

        // if this kpi belongs to variant
        if(currentVariant._id) {
          VariantService.addKpiValue(currentVariant, configuredKpi.kpiAlias, configuredKpi.value);
        } else { // otherwise this is as is situation
          CaseService.addKpiValue(configuredKpi.kpiAlias, configuredKpi.value);
        }

        // socket.emit('setOverallKpiResult', {
        //   caseId: activeCase._id,
        //   userId: currentUser._id,
        //   kpiId: configuredKpi.kpiAlias,
        //   kpiValue: configuredKpi.value,
        //   variantId: currentVariant._id
        // });
        
        // TODO: if variant save with variant service 
        // if as is save with case service
        //KpiService.addKpiValue(configuredKpi.alias, configuredKpi.value);
        
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
      CaseService.updateKpiSettings(configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.disable = function(kpi, state) {
    kpi.disabled = state;
    // if this kpi belongs to variant
    if(currentVariant._id) {
      VariantService.toggleDisabled(currentVariant, kpi);
    } else { // otherwise this is as is situation
      CaseService.toggleDisabled(kpi);
    }
  };

  $scope.goBack = function() {
    $state.transitionTo(backState, {variantId: currentVariant._id});
  };

  $scope.openModule = function() {
    if(kpi.connectedModuleUrl) {
      console.log(kpi.connectedModuleUrl);
      $window.open(kpi.connectedModuleUrl, '_blank');
    }
  };

  $scope.$on('socket:startModule', function (ev, module) {
    console.log(module);
    kpi.status = module.status;
    if(kpi.status !== 'processing') {
      kpi.loading = false;
    }
    kpi.info = module.info;
    if(typeof module.kpiValue == 'number') { //jshint ignore:line
      kpi.value = module.kpiValue;
    }

  });

  // in case the page was reloaded we need to listen directly on the get modules message
  $scope.$on('socket:getModules', function (ev, module) {
    console.log(module);
    if(kpi.selectedModuleId === module.moduleId) {
      kpi.selectedModuleName = module.name;
      kpi.selectedModuleDescription = module.description;
      kpi.connectedModuleUrl = module.connectedModuleUrl;
    }

  });

}]);

