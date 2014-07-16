angular.module( 'idss-dashboard')

.controller( 'UseKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService' , function UseKpiCtrl( $scope, $modalInstance, kpi, ModuleService ) {

  	$scope.kpi = kpi;

  	$scope.relevantModules = [];

  	ModuleService.getModulesFromKpiId(kpi.id).then(function(modules) {
  		_.each(modules, function(module) {
  			$scope.relevantModules.push(module);
  		});
  	});
              
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

  	$scope.useKPI = function() {
      	$modalInstance.close(kpi);
  	};

}]);



