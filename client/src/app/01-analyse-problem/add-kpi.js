angular.module( 'idss-dashboard.analyse-problem.add-kpi', [])

.controller( 'AddKpiCtrl', ['$scope', '$modalInstance', 'KpiService', 'kpi', function AddKpiCtrl( $scope, $modalInstance, KpiService, kpi) {

    $scope.kpi = {
      official: false,
      qualitative: false
    };

    // for updating KPI
    if(kpi) {
        angular.extend($scope.kpi, kpi);
        // if selected this will go through process and update selected KPI
        $scope.kpi.updateSettings = {
            updateForThisProcess: false
        };
    }

    var generateInputs = function() {
        var k = $scope.kpi;
        // this is used to set unique name to input radio group, the alias is ultimately set on server but they don't necessary need to be the same
        k.kpiAlias = k.name.toLowerCase().split(' ').join('-');
        k.unit = k.unit || 'score';

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        // TODO: validation - check if name
        generateInputs();
        $modalInstance.close(angular.copy($scope.kpi));
    };

}]);