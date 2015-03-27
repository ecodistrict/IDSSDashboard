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
      if($scope.editKpiMode) {
        $scope.saveQualitativeKpi();
      }
      $modalInstance.close($scope.kpi);
    };

    $scope.removeKpiFromProcess = function(kpi) {
      VariantService.removeKpi($scope.kpi);
      $modalInstance.dismiss('cancel');
    };

    $scope.editQualitativeKpi = function() {
      $scope.editKpiMode = true;
      var inputSpec = angular.copy($scope.kpi.inputSpecification);
      for(var spec in inputSpec) {
        if (inputSpec.hasOwnProperty(spec)) {
          inputSpec[spec].type = 'text';
          inputSpec[spec].value = inputSpec[spec].label;
          inputSpec[spec].label = "Score " + inputSpec[spec].referenceValue;
        }
      }
      $scope.kpi.inputSpecification = inputSpec;
    };

    $scope.saveQualitativeKpi = function() {
      $scope.editKpiMode = false;
      var inputSpec = angular.copy($scope.kpi.inputSpecification);
      for(var spec in inputSpec) {
        if (inputSpec.hasOwnProperty(spec)) {
          inputSpec[spec].type = 'checkbox';
          inputSpec[spec].label = inputSpec[spec].value;
          inputSpec[spec].value = false;
        }
      }
      $scope.kpi.inputSpecification = inputSpec;
    };

    $scope.setNumberOfQualitativeOptions = function(num) {
      if(num === 3) {
        $scope.kpi.inputSpecification = {
          "kpiScore1": {
              label: "Bad",
              value: "Bad",
              type: 'text',
              order: 1,
              referenceValue: 1
          },
          "kpiScore6": {
              label: "Sufficient",
              value: "Sufficient",
              type: 'text',
              order: 6,
              referenceValue: 6
          },
          "kpiScore10": {
              label: "Excellent",
              value: "Excellent",
              type: 'text',
              order: 9,
              referenceValue: 10
          }
        };
      } else if(num === 10) {
        $scope.kpi.inputSpecification = {
          "kpiScore1": {
              label: "Bad",
              value: "Bad",
              type: 'text',
              order: 1,
              referenceValue: 1
          },
          "kpiScore2": {
              label: "Pretty bad",
              value: "Pretty bad",
              type: 'text',
              order: 2,
              referenceValue: 2
          },
          "kpiScore6": {
              label: "Sufficient",
              value: "Sufficient",
              type: 'text',
              order: 6,
              referenceValue: 6
          },
          "kpiScore10": {
              label: "Excellent",
              value: "Excellent",
              type: 'text',
              order: 9,
              referenceValue: 10
          }
        };
      }
    };

}]);