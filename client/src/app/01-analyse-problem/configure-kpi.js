angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'ProcessService', function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService, ProcessService ) {

  	$scope.kpi = kpi;

  	$scope.relevantModules = [];

  	ModuleService.getModulesFromKpiId(kpi.id).then(function(modules) {
  		_.each(modules, function(module) {
  			$scope.relevantModules.push(module);
  		});
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
      ProcessService.removeKpi(kpi);
      $modalInstance.dismiss('cancel');
    };



}]);
angular.module( 'idss-dashboard.to-be.ambitions-kpi', [])

.controller( 'AmbitionsKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'ProcessService', function AmbitionsKpiCtrl( $scope, $modalInstance, kpi, ModuleService, ProcessService ) {

    $scope.kpi = kpi;

    $scope.relevantModules = [];

    ModuleService.getModulesFromKpiId(kpi.id).then(function(modules) {
      _.each(modules, function(module) {
        $scope.relevantModules.push(module);
      });
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
      ProcessService.removeKpi(kpi);
      $modalInstance.dismiss('cancel');
    };



}]);







