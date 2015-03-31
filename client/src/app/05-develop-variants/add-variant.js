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

  // $scope.setScore = function(kpi) {

  //   var kpiModal = $modal.open({
  //     templateUrl: 'qualitative-kpi-input/qualitative-kpi-input.tpl.html',
  //     controller: 'QualitativeKpiInputCtrl',
  //     resolve: {
  //       kpi: function() {
  //         return kpi;
  //       }
  //     }
  //   });

  //   kpiModal.result.then(function (configuredKpi) {
  //     // update kpi in variant
  //     kpi.status = 'success';
  //     VariantService.updateKpi(variant, configuredKpi);
  //     console.log(configuredKpi.outputs);
  //     kpi.outputs = configuredKpi.outputs;
  //     kpi.loading = false;
  //   }, function () {
  //     console.log('Modal dismissed at: ' + new Date());
  //   });

  // };

  // $scope.setAlternativeInput = function(kpi) {

  // 	var kpiModal = $modal.open({
  //     templateUrl: 'kpi/kpi-input.tpl.html',
  //     controller: 'KpiInputController',
  //     resolve: {
  //       kpi: function() {
  //         return kpi;
  //       },
  //       variant: function() {
  //       	return variant;
  //       }
  //     }
  //   });

  //   kpiModal.result.then(function (configuredKpi) {
  //     // update kpi in variant
  //     kpi.status = 'success';
  //     VariantService.updateKpi(variant, configuredKpi);
  //     console.log(configuredKpi.outputs);
  //     kpi.outputs = configuredKpi.outputs;
  //     kpi.loading = false;
  //   }, function () {
  //     console.log('Modal dismissed at: ' + new Date());
  //   });

  // };


}]);