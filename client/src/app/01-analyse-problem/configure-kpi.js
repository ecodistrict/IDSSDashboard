angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'CaseService', 'KpiService', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, CaseService, KpiService ) {

    // work on a reference
    $scope.kpi = angular.copy(kpi);

    $scope.relevantModules = [];

    var modules = ModuleService.getModulesFromKpiId(kpi.kpiAlias);
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
      CaseService.removeKpi($scope.kpi);
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