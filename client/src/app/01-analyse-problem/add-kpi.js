angular.module( 'idss-dashboard.analyse-problem.add-kpi', [])

.controller( 'AddKpiCtrl', ['$scope', '$modalInstance', function AddKpiCtrl( $scope, $modalInstance) {

  	$scope.kpi = {
      official: false,
      inputs: []
    };
    $scope.qualitative = false;

    var generateInputs = function() {
      var k = $scope.kpi;
      if(k.unit && k.min && k.max) {
        k.inputs.push({
          id: 'kpi-range',
          label: 'Select a value between ' + k.min + ' ' + k.unit + ' and ' + k.max + ' ' + k.unit,
          type: "number",
          min: k.min,
          max: k.max,
          unit: k.unit
        });
      }
      // continue adding more controls from kpi settings - quantitative fields and so on
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  	$scope.ok = function() {
      generateInputs();
      $modalInstance.close($scope.kpi);
  	};

}]);