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
  var asIsVariant;

  $scope.activeCase = activeCase;
  $scope.otherVariants = [];
  $scope.currentUser = currentUser;
  
  _.each(variants, function(variant) {
    if(variant._id === variantId) {
      $scope.currentVariant = currentVariant = variant;
      $scope.currentVariantName = currentVariant.name;
    } else if(variant.type === 'as-is') {
      asIsVariant = variant;
    } else if(variant.type === 'to-be') {
      toBeVariant = variant;
    } else {
      $scope.otherVariants.push(variant);
    }
  });

  if(currentVariant) {
    _.each(activeCase.kpiList, function(kpi) {
      KpiService.removeExtendedData(kpi); // in case data is already extended 
      kpi.loading = true;
      kpi.status = 'initializing';

      socket.emit('getKpiResult', {
        variantId: asIsVariant._id, 
        kpiId: kpi.kpiAlias, 
        moduleId: kpi.selectedModuleId, 
        status: kpi.status,
        userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
        processId: activeCase._id
      });

      $timeout(function() {
        kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
        kpi.loading = false;
      }, 6000);

      // KpiService.getKpiRecord(currentVariant._id, kpi.kpiAlias).then(function(record) {
      //     angular.extend(kpi, record); 
      //     if(kpi.status === 'initializing' || kpi.status === 'processing') {
      //       kpi.loading = true;
      //     } else {
      //       kpi.loading = false;
      //     }
      // });
     
    });

    socket.on('getKpiResult', function(kpiMessage) {
      var kpi = _.find(activeCase.kpiList, function(k) {
        return k.kpiAlias === kpiMessage.kpiId;
      });
      if(kpi) {
        kpi.value = kpiMessage.kpiValue;
        kpi.loading = false;
        kpi.status = kpiMessage.status;
      }
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

