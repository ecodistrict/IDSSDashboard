angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'ProcessService', 'KpiService', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, ProcessService, KpiService ) {

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
        $modalInstance.close($scope.kpi);
    };

    $scope.removeKpiFromProcess = function(kpi) {
      ProcessService.removeKpi($scope.kpi);
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

}]);