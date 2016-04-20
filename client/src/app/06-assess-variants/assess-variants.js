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
        return VariantService._loadVariants();
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
  var kpiList = []; // create immutable version of kpilist due to reference problem when bootstrapping

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
    currentVariant.kpiDisabled = currentVariant.kpiDisabled || {};

    _.each(activeCase.kpiList, function(kpi) {
      KpiService.removeExtendedData(kpi); // in case data is already extended 

      kpi.value = currentVariant.kpiValues[kpi.kpiAlias];
      if(kpi.value || kpi.value === 0) {
        kpi.status = 'success';
      } else {
        kpi.status = 'unprocessed';
      }
      kpi.disabled = currentVariant.kpiDisabled[kpi.kpiAlias];
      // add kpi to new array
      kpiList.push(kpi);
     
    });

    // replace activeCase kpi list because otherwise this referense will change when 
    // downloaded again from the server.. yes, I can explain this better, but a refactor would be in place..
    $scope.activeCase = {
      kpiList: kpiList
    };

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
    } else {
      return 'primary';
    }
  };

  $scope.goToKpiPage = function(kpi) {
    console.log(kpi);
    $state.transitionTo('kpi', {variantId: currentVariant._id, kpiAlias: kpi.kpiAlias, back: 'assess-variants/' + currentVariant._id});
  };

  $scope.showAll = false;
  $scope.toggleHidden = function() {
    $scope.showAll = !$scope.showAll;
  };
  $scope.kpisAreDisabled = function() {
    return _.find($scope.activeCase.kpiList, function(k) {return k.disabled;});
  };

}]);

