angular.module( 'idss-dashboard.to-be', [
  'idss-dashboard.to-be.ambitions-kpi'
])

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
      authorizedRoles: ['Facilitator']
    },
    resolve:{
      variants: ['VariantService', function(VariantService) {
        var v = VariantService.getVariants();
        if(v) {
          return v;
        } else {
          return VariantService.loadVariants();
        }
      }]
    }
  });
}])

.controller( 'ToBeController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'variants', 'ModuleService', 'VariantService', '$modal', function ToBeController( $scope, $timeout, $sce, socket, $state, variants, ModuleService, VariantService, $modal ) {

  var toBeVariant = _.find(variants, function(v) {return v.type === 'to-be';});
  var asIsVariant;

  if(!toBeVariant) {
    asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
    if(asIsVariant) {
      toBeVariant = angular.copy(asIsVariant); // shallow copy
      delete toBeVariant._id;
      toBeVariant.name = 'To be';
      toBeVariant.type = 'to-be';
      toBeVariant.description = "The TO BE state defines the KPI ambitions for a connected user";
      VariantService.createVariant(toBeVariant).then(function(newVariant) {
        console.log(newVariant);
        $scope.toBeVariant = newVariant;
      });
    }
  } else {
    $scope.toBeVariant = toBeVariant;
  }

  console.log(toBeVariant);

  $scope.configureKpi = function(kpi) {

    var kpiModal = $modal.open({
      templateUrl: '04-to-be/ambitions-kpi.tpl.html',
      controller: 'AmbitionsKpiCtrl',
      resolve: {
        kpi: function() {
          return kpi;
        }
      }
    });

    kpiModal.result.then(function (configuredKpi) {
      // add the kpi settings and module spec to as is variant
      VariantService.updateKpi($scope.asIsVariant, configuredKpi);
      ProcessService.addLog({label: 'Configured KPI ' + kpi.name});
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

}]);

