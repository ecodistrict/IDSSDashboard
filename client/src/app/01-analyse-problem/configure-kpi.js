angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'ProcessService', 'socket', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, ProcessService, socket ) {

  	$scope.kpi = kpi;

  	$scope.relevantModules = [];

  	var modules = ModuleService.getModulesFromKpiId(kpi.alias);
  	_.each(modules, function(module) {
  		$scope.relevantModules.push(module);
  	});

    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
      $scope.kpi.selectedModule = angular.copy($scope.kpi.selectedModule);
    };

  	$scope.ok = function() {
      $modalInstance.close(kpi);
      $scope.kpi.selectedModule = angular.copy($scope.kpi.selectedModule);
  	};

    $scope.removeKpiFromProcess = function(kpi) {
      ProcessService.removeKpi($scope.kpi);
      $modalInstance.dismiss('cancel');
    };


}]);