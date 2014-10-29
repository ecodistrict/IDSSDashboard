angular.module( 'idss-dashboard.analyse-problem.add-kpi', [])

.controller( 'AddKpiCtrl', ['$scope', '$modalInstance', function AddKpiCtrl( $scope, $modalInstance) {

  	$scope.kpi = {
      official: false,
      inputs: []
    };
    $scope.qualitative = false;

    var generateInputs = function() {
      var k = $scope.kpi;
      // if(k.unit && k.min && k.max) {
      //   k.inputs.push({
      //     id: 'kpi-range',
      //     label: 'Select a value between ' + k.min + ' ' + k.unit + ' and ' + k.max + ' ' + k.unit,
      //     type: "number",
      //     min: k.min,
      //     max: k.max,
      //     unit: k.unit
      //   });
      // }
      k.inputs.push({
        id: 'kpi-scores',
        type: 'input-group',
        label: 'Limits - define the scores',
        info: 'Info about scores',
        inputs: [{
          id: 'kpi-score-excellent',
          label: 'Excellent',
          type: 'number',
          unit: k.unit
        },{
          id: 'kpi-score-bad',
          label: 'Bad',
          type: 'number',
          unit: k.unit
        }]
      }, {
        id: 'priority-label',
        type: 'input-group',
        label: 'Select how important this KPI is for you',
        info: 'Select a value between 1 - 5 where 1 is very important and 5 is not very important',
        inputs: [{
          //type: 'slider',
          type: 'number',
          label: 'Priority 1 - 5',
          value: 3,
          min: 1,
          max: 5
        }]
      });
    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  	$scope.ok = function() {
      generateInputs();
      $modalInstance.close($scope.kpi);
  	};

}]);