angular.module( 'idss-dashboard.analyse-problem.manage-kpis')

.controller( 'SetupKpiCtrl', ['$scope', '$modalInstance', 'kpi' , function SetupKpiCtrl( $scope, $modalInstance, kpi ) {

  	$scope.kpi = kpi;
              
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

  	$scope.useKPI = function() {
      	$modalInstance.close(kpi);
  	};

}]);



