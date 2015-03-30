angular.module( 'idss-dashboard.analyse-problem.add-kpi', [])

.controller( 'AddKpiCtrl', ['$scope', '$modalInstance', 'KpiService', function AddKpiCtrl( $scope, $modalInstance, KpiService) {

    $scope.kpi = {
      official: false,
      inputSpecification: {},
      qualitative: false
    };

    var generateInputs = function() {
        var k = $scope.kpi;
        // this is used to set unique name to input radio group, the alias is ultimately set on server but they don't necessary need to be the same
        k.alias = k.name.toLowerCase().split(' ').join('-');

      
      if(k.qualitative) {

        // TODO: add all spec to kpi service, this is duplicated in configure kpi!

        k.inputSpecification = {
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
            },
            "kpiScores": {
                type: 'inputGroup',
                label: 'Select one option',
                info: 'Info',
                inputs: {
                    "kpiScore1": {
                      label: "Bad",
                      type: 'radio',
                      name: k.alias,
                      order: 1,
                      referenceValue: 1
                  },
                  "kpiScore6": {
                      label: "Sufficient",
                      type: 'radio',
                      name: k.alias,
                      order: 6,
                      referenceValue: 6
                  },
                  "kpiScore10": {
                      label: "Excellent",
                      type: 'radio',
                      name: k.alias,
                      order: 10,
                      referenceValue: 10
                  }
              }
            }
        };

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
        // check if name
        generateInputs();
        $modalInstance.close($scope.kpi);
    };

}]);