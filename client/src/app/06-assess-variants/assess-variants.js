angular.module( 'idss-dashboard.assess-variants', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'assess-variants', {
    url: '/assess-variants/:variantId',
    views: {
      "main": {
        controller: 'AssessVariantsController',
        templateUrl: '06-assess-variants/assess-variants.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Assess variants',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    },
    resolve:{
      activeCase: ['CaseService', function(CaseService) {
        return CaseService.loadActiveCase().then(function(activeCase) {
          return activeCase;
        });
      }],
      variants: ['VariantService', function(VariantService) {
        var v = VariantService.getVariants();
        if(v) {
          return v;
        } else {
          return VariantService.loadVariants();
        }
      }],
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          return user;
        });
      }]
    }
  });
}])

.controller( 'AssessVariantsController', ['$scope', '$timeout', 'socket', '$stateParams', 'variants', 'activeCase', 'ModuleService', 'VariantService', '$modal', 'KpiService', '$state', 'currentUser', 
  function AssessVariantsController( $scope, $timeout, socket, $stateParams, variants, activeCase, ModuleService, VariantService, $modal, KpiService, $state, currentUser ) {

  var variantId = $stateParams.variantId;
  var currentVariant;

  $scope.activeCase = activeCase;
  $scope.otherVariants = [];
  $scope.currentUser = currentUser;
  
  _.each(variants, function(variant) {
    if(variant._id === variantId) {
      $scope.currentVariant = currentVariant = variant;
    } else {
      $scope.otherVariants.push(variant);
    }
  });

  if(currentVariant) {

    currentVariant.kpiValues = currentVariant.kpiValues || {};
    
    _.each(activeCase.kpiList, function(kpi) {
      KpiService.removeExtendedData(kpi); // in case data is already extended 

      kpi.value = currentVariant.kpiValues[kpi.kpiAlias];
      if(kpi.value || kpi.value === 0) {
        kpi.status = 'success';
      } else {
        kpi.status = 'unprocessed';
      }
      
      // socket.emit('getKpiResult', {
      //   variantId: variantId, 
      //   kpiId: kpi.kpiAlias, 
      //   moduleId: kpi.selectedModuleId, 
      //   status: kpi.status,
      //   userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
      //   caseId: activeCase._id
      // });

      // $timeout(function() {
      //   kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
      //   kpi.loading = false;
      // }, 6000);
     
    });

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

  $scope.goToKpiPage = function(kpi) {
    console.log(kpi);
    $state.transitionTo('kpi', {variantId: currentVariant._id, kpiAlias: kpi.kpiAlias, back: 'assess-variants/' + currentVariant._id});
  };

}]);

