angular.module( 'idss-dashboard.analyse-problem.add-kpi', [])

.controller( 'AddKpiCtrl', ['$scope', '$modalInstance', function AddKpiCtrl( $scope, $modalInstance) {

  	$scope.kpi = {
      official: false,
      inputSpecification: {},
      qualitative: false
    };
    $scope.kpiSteps = 0;
    $scope.multiple = false;

    $scope.$watch('kpiSteps', function(newVal, oldVal) {
      if(newVal !== oldVal) {
        $scope.kpi.steps = [];
        for(var i = 1; i <= newVal; i++) {
          $scope.kpi.steps.push({
            id: 'kpi-step-' + i,
            description: '',
            referenceValue: '',
            label: 'Indicator value ' + i
          });
        }
      }
    });

    var generateInputs = function() {
      var k = $scope.kpi;
      
      if(k.qualitative) {

        k.inputSpecification = {
          "kpiScore1": {
              label: "Bad",
              value: false,
              type: 'checkbox',
              order: 1,
              referenceValue: 1
          },
          "kpiScore6": {
              label: "Sufficient",
              value: false,
              type: 'checkbox',
              order: 6,
              referenceValue: 6
          },
          "kpiScore10": {
              label: "Excellent",
              value: false,
              type: 'checkbox',
              order: 10,
              referenceValue: 10
          }
        };

        // if(k.steps < 1 || k.steps > 20) {
        //   return;
        // }

        // _.each(k.steps, function(step, i) {
        //   var input = {
        //     id: 'step-' + (i+1),
        //     name: 'group',
        //     label: step.description,
        //     referenceValue: step.referenceValue || step.description,
        //     unit: step.unit
        //   };
        //   if($scope.multiple) {
        //     input.type = 'checkbox';
        //   } else {
        //     input.type = 'radio';
        //   }
        //   k.inputs.push(input);
        // });
          

      } else {

        k.inputSpecification = {
          "kpiScores": {
            type: 'inputGroup',
            label: 'Limits - define the scores',
            info: 'Info about scores',
            inputs: {
              "kpiScoreExcellent": {
                label: 'Excellent',
                type: 'number',
                unit: k.unit
              },
              "kpiScoreBad": {
                label: 'Bad',
                type: 'number',
                unit: k.unit
              }
            }
          },
          "priorityLabel": {
            type: 'inputGroup',
            label: 'Select how important this KPI is for you',
            info: 'Select a value between 1 - 5 where 1 is very important and 5 is not very important',
            inputs: {
              "priorityValue": {
                type: 'number',
                label: 'Priority 1 - 5',
                value: 3,
                min: 1,
                max: 5
              }
            }
          }
        };
      }

    };

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

  	$scope.ok = function() {
      generateInputs();
      $modalInstance.close($scope.kpi);
  	};

}]);