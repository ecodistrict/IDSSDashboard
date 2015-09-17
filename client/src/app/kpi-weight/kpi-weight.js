angular.module( 'idss-dashboard.kpi-weight', [])

.controller( 'KpiWeightController', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'KpiService', function KpiWeightController( $scope, $modalInstance, kpi, ModuleService, VariantService, KpiService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);
    if(kpi.qualitative && kpi.qualitativeSettings && kpi.qualitativeSettings.length === 10) {
        $scope.kpi.descriptionSufficient = kpi.qualitativeSettings[4].value;
        $scope.kpi.descriptionExcellent = kpi.qualitativeSettings[0].value;
    }

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.validateWeight = function() {
        if($scope.kpi.weight >= 0 && $scope.kpi.weight <= 5) {
            $scope.validationError = "";
        } else {
            $scope.validationError = "Value needs to be between 0 and 5";
        }
    };

    $scope.validateMin = function() {
        if(angular.isNumber($scope.kpi.minimum)) {
            $scope.validationError = "";
        } else {
            $scope.validationError = "Value needs to be a number";
        }
    };

    $scope.ok = function() {
        if($scope.kpi.weight >= 0 && $scope.kpi.weight <= 5) {
            $modalInstance.close($scope.kpi);
        } else {
            $scope.validationError = "Please provide a number between 0 and 5";
        }
    };

}]);