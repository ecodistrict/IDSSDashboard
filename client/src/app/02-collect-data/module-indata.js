angular.module( 'idss-dashboard.collect-data.module-indata', [])

.controller( 'ModuleIndataCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService' , function ModuleIndataCtrl( $scope, $modalInstance, kpi, ModuleService ) {

  	$scope.kpi = kpi;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

  	$scope.useKPI = function() {
      	$modalInstance.close(kpi);
  	};

}]);



