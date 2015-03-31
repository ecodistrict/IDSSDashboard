angular.module( 'idss-dashboard.collect-data.module-input', [])

.controller( 'ModuleInputController', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'currentVariant', function ModuleInputController( $scope, $modalInstance, kpi, ModuleService, VariantService, currentVariant ) {

  $scope.kpi = kpi;
  $scope.currentVariant = currentVariant;

  // crappy code, assume variants are cached
  var variants = VariantService.getVariants();
  var asIsVariant;
  if(variants) {
    asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

    ModuleService.getModuleInput(currentVariant._id, kpi.moduleId, kpi.alias, asIsVariant._id).then(function(module) {
      $scope.module = module;
    });
  }

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    $modalInstance.close($scope.module);
  };

}]);