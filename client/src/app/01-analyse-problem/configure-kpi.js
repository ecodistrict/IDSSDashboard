angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'KpiService', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, VariantService, KpiService ) {

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
        if($scope.kpi.qualitative) {
            KpiService.generateQualitativeKpiInputSpecification($scope.kpi);
        } else {
            KpiService.generateQuantitativeKpiInputSpecification($scope.kpi);
        }
        $modalInstance.close($scope.kpi);
    };

    $scope.removeKpiFromProcess = function(kpi) {
      VariantService.removeKpi($scope.kpi);
      $modalInstance.dismiss('cancel');
    };

    $scope.saveSettingText = function(setting) {
        if((setting.referenceValue === 10 || 
            setting.referenceValue === 6 ||
            setting.referenceValue === 1 ||
            setting.referenceValue === 0) &&
            setting.value === "") {
                $scope.validationError = "A mandatory text value is missing!";
        } else {
            $scope.validationError = "";
            setting.edit = false;
        }
    };

    // $scope.editQualitativeKpi = function() {
    //     $scope.editKpiMode = true;
    //     var inputSpec = angular.copy($scope.kpi.settings);
    //     var scoreInputs = inputSpec["kpiScores"].inputs;
    //     for(var spec in scoreInputs) {
    //         if (scoreInputs.hasOwnProperty(spec)) {
    //             scoreInputs[spec].type = 'text';
    //             scoreInputs[spec].value = scoreInputs[spec].label;
    //             scoreInputs[spec].label = "Score " + scoreInputs[spec].referenceValue;
    //         }
    //     }
    //     // only add kpi scores to input to clean the interface
    //     $scope.kpi.settings = {
    //         "kpiScores": {
    //             type: 'inputGroup', // TODO: set this on kpi service!
    //             label: 'Give KPI score values', // TODO: set this on kpi service!
    //             info: 'A score of 1 is worst and a score of 10 is best. The scores 1, 6 and 10 is mandatory', // TODO: set this on kpi service!
    //             inputs: scoreInputs
    //         }
    //     };
    // };


    
    // // TODO: this function should be refactored with iterative declaration!
    // $scope.setNumberOfQualitativeOptions = function(num) {

    //     var currentSpec = $scope.kpi.settings,
    //         scoreText = "",
    //         currentScore;

    //     var spec = {
    //       "kpiScore1": {
    //           label: "Score 1",
    //           value: currentSpec["kpiScores"].inputs["kpiScore1"].value || "Bad",
    //           type: 'text',
    //           order: 1,
    //           referenceValue: 1
    //       },
    //       "kpiScore6": {
    //           label: "Score 6",
    //           value: currentSpec["kpiScores"].inputs["kpiScore6"].value || "Sufficient",
    //           type: 'text',
    //           order: 6,
    //           referenceValue: 6
    //       },
    //       "kpiScore10": {
    //           label: "Score 10",
    //           value: currentSpec["kpiScores"].inputs["kpiScore10"].value || "Excellent",
    //           type: 'text',
    //           order: 10,
    //           referenceValue: 10
    //       }
    //     };
        
    //     if(num === 10) {
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore2"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore2"] = {
    //             label: "Score 2",
    //             value: scoreText,
    //             type: 'text',
    //             order: 2,
    //             referenceValue: 2
    //         };
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore3"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore3"] = {
    //             label: "Score 3",
    //             value: scoreText,
    //             type: 'text',
    //             order: 3,
    //             referenceValue: 3
    //         };
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore4"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore4"] = {
    //             label: "Score 4",
    //             value: scoreText,
    //             type: 'text',
    //             order: 4,
    //             referenceValue: 4
    //         };
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore5"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore5"] = {
    //             label: "Score 5",
    //             value: scoreText,
    //             type: 'text',
    //             order: 5,
    //             referenceValue: 5
    //         };
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore7"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore7"] = {
    //             label: "Score 7",
    //             value: scoreText,
    //             type: 'text',
    //             order: 7,
    //             referenceValue: 7
    //         };
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore8"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore8"] = {
    //             label: "Score 8",
    //             value: scoreText,
    //             type: 'text',
    //             order: 8,
    //             referenceValue: 8
    //         };
    //         currentScore = currentSpec["kpiScores"].inputs["kpiScore9"];
    //         scoreText = (currentScore && currentScore.value) ? currentScore.value : "";
    //         spec["kpiScore9"] = {
    //             label: "Score 9",
    //             value: scoreText,
    //             type: 'text',
    //             order: 9,
    //             referenceValue: 9
    //         };
        
    //     } 

    //     $scope.kpi.settings = {
    //         "kpiScores": {
    //             type: 'inputGroup', // TODO: set this on kpi service!
    //             label: 'Give KPI score values', // TODO: set this on kpi service!
    //             info: 'A score of 1 is worst and a score of 10 is best. The scores 1, 6 and 10 is mandatory', // TODO: set this on kpi service!
    //             inputs: spec
    //         }
    //     };
    // };

}]);