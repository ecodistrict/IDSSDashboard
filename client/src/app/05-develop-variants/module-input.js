angular.module( 'idss-dashboard.develop-variants.module-input', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'variant-module-input', {
    url: '/develop-variants/module-input/:variantId/:kpiId',
    views: {
      "main": {
        controller: 'VariantModuleInputCtrl',
        templateUrl: '05-develop-variants/module-input.tpl.html'
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
      }],
      currentProcess: ['ProcessService', function(ProcessService) {
        var p = ProcessService.getCurrentProcess();
        if(p) {
          return p;
        } else {
          return ProcessService.loadCurrentProcess();
        }
      }]
    } 
  });
}])

.controller( 'VariantModuleInputCtrl', ['$scope', '$stateParams', 'variants', 'ModuleService', 'currentProcess', function VariantModuleInputCtrl( $scope, $stateParams, variants, ModuleService, currentProcess ) {

  if(!$stateParams.kpiId) {
    console.log('missing params');
    return;
  }

  $scope.asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  $scope.currentVariant = _.find(variants, function(v) {return v._id === $stateParams.variantId;});
  $scope.currentProcess = currentProcess;

  var kpi = _.find($scope.currentVariant.kpiList, function(k) {
    return k.alias === $stateParams.kpiId;
  });

  if(!kpi) {
    console.log('missing kpi/module');
    return;
  }

  $scope.kpi = kpi;

  ModuleService.getModuleInput($scope.asIsVariant._id, kpi.selectedModule.id, kpi.alias).then(function(module) {
    console.log(module);
    $scope.module = module;
  });


}]);

