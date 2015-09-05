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
      currentProcess: ['ProcessService', function(ProcessService) {
        return ProcessService.loadCurrentProcess().then(function(currentProcess) {
          return currentProcess;
        });
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

.controller( 'ToBeController', ['$scope', 'currentProcess', 'currentUser', 'variants', 'VariantService', '$modal', 'KpiService', 'LoginService', 
  function ToBeController( $scope, currentProcess, currentUser, variants, VariantService, $modal, KpiService, LoginService ) {

    var toBeVariant = _.find(variants, function(v) {return v.type === 'to-be';});
    var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
    $scope.currentUser = currentUser;
    $scope.stakeholders = [];
    $scope.isFacilitator = currentUser.role === 'Facilitator';

    var init = function(userId) {
      _.each(currentProcess.kpiList, function(kpi) {
        KpiService.removeExtendedData(kpi); // in case data is already extended
        kpi.loading = true;
        kpi.status = 'initializing';
        kpi.weight = 3; // default weight if kpi record does not exist
        KpiService.getKpiRecord(toBeVariant._id, kpi.kpiAlias, userId).then(function(record) {
          angular.extend(kpi, record); 
          if(kpi.status === 'initializing' || kpi.status === 'processing') {
            kpi.loading = true;
          } else {
            kpi.loading = false;
          }
        });
      });
    };

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
        
        kpi.weight = configuredKpi.weight;
        kpi.value = configuredKpi.value;
        kpi.minimum = configuredKpi.minimum;

        // if user is changed the id needs to be correct (first time it is always the facilitator id)
        configuredKpi.userId = $scope.currentUser._id;

        console.log(configuredKpi);
        
        KpiService.updateKpiRecord(configuredKpi);
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

