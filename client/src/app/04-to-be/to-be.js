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
    
    var isFacilitator = $scope.isFacilitator = (currentUser.role === 'Facilitator');
    // needed to get the as is values
    var facilitatorId = isFacilitator ? currentUser._id : currentUser.facilitatorId;

    var init = function(stakeholder) {

      console.log(stakeholder);

      var kpiWeights = stakeholder.kpiWeights || {};
      kpiWeights[activeCase._id] = kpiWeights[activeCase._id] || {};

      var kpiAmbitions = stakeholder.kpiAmbitions || {};
      kpiAmbitions[activeCase._id] = kpiAmbitions[activeCase._id] || {};

      _.each(activeCase.kpiList, function(kpi) {
        KpiService.removeExtendedData(kpi); // in case data is already extended
        kpi.loading = true;
        kpi.status = 'initializing';
        kpi.weight = kpiWeights[activeCase._id][kpi.kpiAlias] || 0; // default weight if kpi record does not exist
        kpi.ambition = kpiAmbitions[activeCase._id][kpi.kpiAlias]; // could be undefined
        KpiService.setKpiColor(kpi, 'ambition');
        console.log(kpi.ambition);

        // get the as is values
        socket.emit('getKpiResult', {
          variantId: asIsVariant._id, 
          kpiId: kpi.kpiAlias, 
          moduleId: kpi.selectedModuleId, 
          status: kpi.status,
          userId: facilitatorId,
          caseId: activeCase._id
        });

        $timeout(function() {
          kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
          kpi.loading = false;
        }, 6000);

      });
    };

    var getStakeholders = function() {
      LoginService.getStakeholders().then(function(stakeholders) {
        if(stakeholders && stakeholders.length && stakeholders.length > 0) {
          $scope.stakeholder = stakeholders[0];
          $scope.stakeholders = stakeholders;
          init($scope.stakeholder);
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
              if(!isFacilitator) {
                init(currentUser);
              } else {
                getStakeholders();
              }
            });
        } else {
          if(!isFacilitator) {
            init(currentUser);
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

        configuredKpi.userId = $scope.stakeholder._id;
        configuredKpi.caseId = activeCase._id;

        KpiService.saveKpiWeight(configuredKpi);
        KpiService.saveKpiAmbition(configuredKpi);

        // trigger update in gui
        kpi.weight = configuredKpi.weight;
        kpi.ambition = configuredKpi.ambition;

      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });

  };

  $scope.getStatus = function(kpi) {
    if(kpi.ambition || kpi.ambition === 0) {
      return 'success';
    } else {
      return 'warning';
    } 
  };

  // TODO: this is an indicator whether the KPI is ok or not 
  $scope.kpiIsConfigured = function(kpi) {
    return kpi.ambition || kpi.ambition === 0;
  };

  $scope.changeUser = function(user) {
    $scope.currentUser = user;
    init(user._id);
  };


}]);

