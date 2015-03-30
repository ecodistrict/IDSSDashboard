angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, VariantService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);
    $scope.kpi.selectedModule = angular.copy(kpi.selectedModule);

    $scope.relevantModules = [];

    var modules = ModuleService.getModulesFromKpiId(kpi.alias);
    _.each(modules, function(module) {
        $scope.relevantModules.push(module);
    });

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        var validated = true;
        if($scope.editKpiMode) {
            validated = $scope.saveQualitativeKpi();
        }
        if(validated) {
            $modalInstance.close($scope.kpi);
        }
    };

    $scope.removeKpiFromProcess = function(kpi) {
      VariantService.removeKpi($scope.kpi);
      $modalInstance.dismiss('cancel');
    };

    $scope.editQualitativeKpi = function() {
        $scope.editKpiMode = true;
        var inputSpec = angular.copy($scope.kpi.inputSpecification);
        var scoreInputs = inputSpec["kpiScores"].inputs;
        for(var spec in scoreInputs) {
            if (scoreInputs.hasOwnProperty(spec)) {
                scoreInputs[spec].type = 'text';
                scoreInputs[spec].value = scoreInputs[spec].label;
                scoreInputs[spec].label = "Score " + scoreInputs[spec].referenceValue;
            }
        }
        // only add kpi scores to input to clean the interface
        $scope.kpi.inputSpecification = {
            "kpiScores": {
                type: 'inputGroup', // TODO: set this on kpi service!
                label: 'Give KPI score values', // TODO: set this on kpi service!
                info: 'A score of 1 is worst and a score of 10 is best. The scores 1, 6 and 10 is mandatory', // TODO: set this on kpi service!
                inputs: scoreInputs
            }
        };
    };

    $scope.moreOptions = function() {
        var inputs = $scope.kpi.inputSpecification,
            size = _.size(inputs["kpiScores"].inputs);
        return size > 3;
    };

    // this recreates the input spec again after editing
    // TODO: get this from kpi service, this is now duplicated in add kpi and below in set num kpi options
    $scope.saveQualitativeKpi = function() {
        var inputSpec = angular.copy($scope.kpi.inputSpecification);
        var scoreInputs = inputSpec["kpiScores"].inputs;
        var isValid = true;
        for(var spec in scoreInputs) {
            if (scoreInputs.hasOwnProperty(spec)) {
              scoreInputs[spec].type = 'radio';
              scoreInputs[spec].name = $scope.kpi.alias;
              scoreInputs[spec].label = scoreInputs[spec].value;
              scoreInputs[spec].value = false;
              // if no text was given, delete that property if not 1, 6 or 10 that are mandatory
              if(scoreInputs[spec].label === "") {
                if(scoreInputs[spec].referenceValue === 1 || scoreInputs[spec].referenceValue === 6 || scoreInputs[spec].referenceValue === 10) {
                    isValid = false;
                } 
              }
            }
        }

        if(isValid) {

            $scope.editKpiMode = false;

            // delete unused slots, 1, 6 and 10 are already checked
            for(var sI in scoreInputs) {
                if (scoreInputs.hasOwnProperty(sI)) {
                    if(scoreInputs[sI].label === "") {
                        delete scoreInputs[sI];
                    }
                }
            }
      
            $scope.kpi.inputSpecification = {
                "priorityLabel": {
                    type: 'inputGroup',
                    order: 0,
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
                    type: 'inputGroup', // TODO: set this on kpi service!
                    label: 'Select one option', // TODO: set this on kpi service!
                    info: 'Info', // TODO: set this on kpi service!
                    inputs: scoreInputs
                }
            };

            $scope.validationError = "";
            return true;

        } else {

            $scope.validationError = "A value must be given to the scores 1 (bad), 6 (sufficient) and 10 (excellent).";
            return false;

        }

    };

    // TODO: this function should be refactored with iterative declaration!
    $scope.setNumberOfQualitativeOptions = function(num) {

        var currentSpec = $scope.kpi.inputSpecification,
            scoreText = "",
            currentScore;

        var spec = {
          "kpiScore1": {
              label: "Score 1",
              value: currentSpec["kpiScores"].inputs["kpiScore1"].value || "Bad",
              type: 'text',
              order: 1,
              referenceValue: 1
          },
          "kpiScore6": {
              label: "Score 6",
              value: currentSpec["kpiScores"].inputs["kpiScore6"].value || "Sufficient",
              type: 'text',
              order: 6,
              referenceValue: 6
          },
          "kpiScore10": {
              label: "Score 10",
              value: currentSpec["kpiScores"].inputs["kpiScore10"].value || "Excellent",
              type: 'text',
              order: 10,
              referenceValue: 10
          }
        };
        
        if(num === 10) {
            currentScore = currentSpec["kpiScores"].inputs["kpiScore2"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore2"] = {
                label: "Score 2",
                value: scoreText,
                type: 'text',
                order: 2,
                referenceValue: 2
            };
            currentScore = currentSpec["kpiScores"].inputs["kpiScore3"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore3"] = {
                label: "Score 3",
                value: scoreText,
                type: 'text',
                order: 3,
                referenceValue: 3
            };
            currentScore = currentSpec["kpiScores"].inputs["kpiScore4"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore4"] = {
                label: "Score 4",
                value: scoreText,
                type: 'text',
                order: 4,
                referenceValue: 4
            };
            currentScore = currentSpec["kpiScores"].inputs["kpiScore5"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore5"] = {
                label: "Score 5",
                value: scoreText,
                type: 'text',
                order: 5,
                referenceValue: 5
            };
            currentScore = currentSpec["kpiScores"].inputs["kpiScore7"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore7"] = {
                label: "Score 7",
                value: scoreText,
                type: 'text',
                order: 7,
                referenceValue: 7
            };
            currentScore = currentSpec["kpiScores"].inputs["kpiScore8"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore8"] = {
                label: "Score 8",
                value: scoreText,
                type: 'text',
                order: 8,
                referenceValue: 8
            };
            currentScore = currentSpec["kpiScores"].inputs["kpiScore9"];
            scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
            spec["kpiScore9"] = {
                label: "Score 9",
                value: scoreText,
                type: 'text',
                order: 9,
                referenceValue: 9
            };
        
        } 

        $scope.kpi.inputSpecification = {
            "kpiScores": {
                type: 'inputGroup', // TODO: set this on kpi service!
                label: 'Give KPI score values', // TODO: set this on kpi service!
                info: 'A score of 1 is worst and a score of 10 is best. The scores 1, 6 and 10 is mandatory', // TODO: set this on kpi service!
                inputs: spec
            }
        };
    };

}]);