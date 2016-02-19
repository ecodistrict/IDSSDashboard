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
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          return user;
        });
      }]
    }
  });
}])

.controller( 'ToBeController', ['$scope', 'socket', '$timeout', 'activeCase', 'currentUser', 'VariantService', '$modal', 'KpiService', 'LoginService', 
  function ToBeController( $scope, socket, $timeout, activeCase, currentUser, VariantService, $modal, KpiService, LoginService ) {

    $scope.currentCase = activeCase; 
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
        kpi.value = activeCase.kpiValues[kpi.kpiAlias];
        kpi.weight = kpiWeights[activeCase._id][kpi.kpiAlias] || 0; // default weight if kpi record does not exist
        kpi.ambition = kpiAmbitions[activeCase._id][kpi.kpiAlias]; // could be undefined
        KpiService.setKpiColor(kpi, 'ambition');
        console.log(kpi.ambition);

      });
    };

    var getStakeholders = function() {
      LoginService.getStakeholders(activeCase._id).then(function(stakeholders) {
        if(stakeholders && stakeholders.length && stakeholders.length > 0) {
          $scope.stakeholder = stakeholders[0];
          $scope.stakeholders = stakeholders;
          init($scope.stakeholder);
        }
      });
    };
    
    if(!isFacilitator) {
      init(currentUser);
    } else {
      getStakeholders();
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

