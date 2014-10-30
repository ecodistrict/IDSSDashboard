angular.module( 'idss-dashboard.collect-data.module-input', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'module-input', {
    url: '/collect-data/module-input/:kpiAlias',
    views: {
      "main": {
        controller: 'ModuleInputCtrl',
        templateUrl: '02-collect-data/module-input.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Module input',
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
    }, 
  });
}])

.controller( 'ModuleInputCtrl', ['$scope', '$stateParams', 'variants', 'ModuleService', function ModuleInputCtrl( $scope, $stateParams, variants, ModuleService ) {

  if(!$stateParams.kpiAlias) {
    console.log('missing params');
    return;
  }

  $scope.asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

  var kpi = _.find($scope.asIsVariant.kpiList, function(k) {
    return k.alias === $stateParams.kpiAlias;
  });

  if(!kpi) {
    console.log('missing kpi/module');
    return;
  }

  $scope.kpi = kpi;

  ModuleService.getModuleInput($scope.asIsVariant._id, kpi.selectedModule.id).then(function(module) {
    $scope.module = module;
  });


}]);

