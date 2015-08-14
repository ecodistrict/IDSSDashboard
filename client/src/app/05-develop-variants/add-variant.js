angular.module( 'idss-dashboard.develop-variants.add-variant', [])

.controller( 'AddVariantController', ['$scope', '$modalInstance', 'variant', 'ModuleService', 'VariantService', 'KpiService', 'socket', '$modal', function AddVariantController( $scope, $modalInstance, variant, ModuleService, VariantService, KpiService, socket, $modal ) {

    // work on a reference
    variant.editName = false;
    variant.editDescription = false;
    $scope.variant = angular.copy(variant);

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
      $modalInstance.close($scope.variant);
    };


}]);