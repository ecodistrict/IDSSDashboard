angular.module( 'idss-dashboard.analyse-problem.add-kpi', [])

.controller( 'AddKpiCtrl', ['$scope', '$modalInstance', 'KpiService', function AddKpiCtrl( $scope, $modalInstance, KpiService) {

    $scope.kpi = {
      official: false,
      qualitative: false
    };

    var generateInputs = function() {
        var k = $scope.kpi;
        // this is used to set unique name to input radio group, the alias is ultimately set on server but they don't necessary need to be the same
        k.alias = k.name.toLowerCase().split(' ').join('-');
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