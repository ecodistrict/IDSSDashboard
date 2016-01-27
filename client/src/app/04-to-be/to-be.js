angular.module( 'idss-dashboard.to-be', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'to-be', {
    url: '/to-be',
    views: {
      "main": {
        controller: 'ToBeController',
        templateUrl: '04-to-be/to-be.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'To be',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    },
    resolve:{
      activeCase: ['CaseService', function(CaseService) {
        var p = CaseService.getActiveCase();
        if(p._id) {
          return p;
        } else {
          return CaseService.loadActiveCase();
        }
      }],
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }],
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          return user;
        });
      }]
    }
  });
}])

.controller( 'ToBeController', ['$scope', 'socket', '$timeout', 'activeCase', 'currentUser', 'variants', 'VariantService', '$modal', 'KpiService', 'LoginService', 
  function ToBeController( $scope, socket, $timeout, activeCase, currentUser, variants, VariantService, $modal, KpiService, LoginService ) {

    $scope.currentCase = activeCase; 

    var toBeVariant = _.find(variants, function(v) {return v.type === 'to-be';});
    var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
    $scope.currentUser = currentUser;
    $scope.stakeholders = [];
    // REFACTOR THIS - mess with "current user", facilitator, active user.
    var isFacilitator = $scope.isFacilitator = (currentUser.role === 'Facilitator');
    var facilitatorId = null;
    if(isFacilitator) {
      // currentUser is overridden after getStakeholders for the selection list
      // TODO: better to separate currentUser and selectedUser...
      facilitatorId = currentUser._id;
    }

    var init = function(userId) {

      var kpiWeights = currentUser.kpiWeights || {};
      kpiWeights[activeCase._id] = kpiWeights[activeCase._id] || {};

      _.each(activeCase.kpiList, function(kpi) {
        KpiService.removeExtendedData(kpi); // in case data is already extended
        kpi.loading = true;
        kpi.status = 'initializing';
        kpi.weight = kpiWeights[activeCase._id][kpi.kpiAlias] || 0; // default weight if kpi record does not exist

        socket.emit('getKpiResult', {
          variantId: asIsVariant._id, 
          kpiId: kpi.kpiAlias, 
          moduleId: kpi.selectedModuleId, 
          status: kpi.status,
          userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
          caseId: activeCase._id
        });

        socket.emit('getKpiResult', {
          variantId: toBeVariant._id, 
          kpiId: kpi.kpiAlias, 
          moduleId: kpi.selectedModuleId, 
          status: kpi.status,
          userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
          caseId: activeCase._id
        });

        $timeout(function() {
          kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
          kpi.loading = false;
        }, 6000);

        // KpiService.getKpiRecord(toBeVariant._id, kpi.kpiAlias, userId).then(function(record) {
        //   KpiService.getKpiRecord(asIsVariant._id, kpi.kpiAlias, facilitatorId).then(function(asIsRecord) {
        //     kpi.asIsValue = asIsRecord.disabled ? undefined : asIsRecord.value;
        //     angular.extend(kpi, record);
        //     KpiService.setKpiColor(kpi);
        //     if(kpi.status === 'initializing' || kpi.status === 'processing') {
        //       kpi.loading = true;
        //     } else {
        //       kpi.loading = false;
        //     }
        //   });
        // });
      });
    };

    socket.on('getKpiResult', function(kpiMessage) {
      var kpi = _.find(activeCase.kpiList, function(k) {
        return k.kpiAlias === kpiMessage.kpiId && k.variantId === kpiMessage.variantId;
      });
      if(kpi) {
        if(kpiMessage.variantId === asIsVariant._id) {
          kpi.asIsValue = kpiMessage.kpiValue;
        } else {
          kpi.value = kpiMessage.kpiValue;
        }
        kpi.loading = false;
        kpi.status = kpiMessage.status;
      }
    });

    var getStakeholders = function() {
      LoginService.getStakeholders().then(function(stakeholders) {
        if(stakeholders && stakeholders.length && stakeholders.length > 0) {
          $scope.currentUser = stakeholders[0];
          $scope.stakeholders = stakeholders;
          init($scope.currentUser._id);
        }
      });
    };

    if(asIsVariant) {
        // if first time - create the to be variant
        if(!toBeVariant) {
            toBeVariant = angular.copy(asIsVariant); // shallow copy
            delete toBeVariant._id;
            toBeVariant.name = 'To be';
            toBeVariant.type = 'to-be';
            toBeVariant.description = "The TO BE state defines the KPI ambitions for a connected user";
            
            VariantService.createVariant(toBeVariant).then(function(newVariant) {
              toBeVariant = newVariant;
              variants.push(toBeVariant);
              // if facilitator the 
              if(!$scope.isFacilitator) {
                init(currentUser._id);
              } else {
                getStakeholders();
              }
            });
        } else {
          if(!$scope.isFacilitator) {
            init(currentUser._id);
          } else {
            getStakeholders();
          }
        }
    }

  $scope.setWeight = function(kpi) {

    var kpiModal, 
        templateUrl = 'kpi-weight/kpi-weight.tpl.html', 
        controller = 'KpiWeightController';
   

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

        if(kpi.weight !== configuredKpi.weight) {

          configuredKpi.caseId = activeCase._id;

          KpiService.saveKpiWeight(configuredKpi);

          // trigger update in gui
          kpi.weight = configuredKpi.weight;

        }
        

        // if user is changed the id needs to be correct (first time it is always the facilitator id)
        configuredKpi.userId = $scope.currentUser._id;

        console.log(configuredKpi);

        if(kpi.value !== configuredKpi.value) {

          socket.emit('setKpiResult', {
            caseId: activeCase._id,
            variantId: toBeVariant._id,
            kpiId: configuredKpi.kpiAlias,
            userId: currentUser._id,
            kpiValue: configuredKpi.value
          });

          // trigger update in gui
          kpi.value = configuredKpi.value;

        }
          
        //KpiService.updateKpiRecord(configuredKpi);
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });

  };

  $scope.getStatus = function(kpi) {
    if(kpi.value || kpi.value === 0) {
      return 'success';
    } else {
      return 'warning';
    } 
  };

  // TODO: this is an indicator whether the KPI is ok or not 
  $scope.kpiIsConfigured = function(kpi) {
    return kpi.value || kpi.value === 0;
  };

  $scope.changeUser = function(user) {
    $scope.currentUser = user;
    init(user._id);
  };


}]);

