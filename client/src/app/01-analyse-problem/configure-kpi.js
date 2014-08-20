angular.module( 'idss-dashboard.analyse-problem.configure-kpi', [])

.controller( 'ConfigureKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService' , function ConfigureKpiCtrl( $scope, $modalInstance, kpi, ModuleService ) {

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



}]);



