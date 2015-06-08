angular.module( 'idss-dashboard.analyse-problem.use-kpi', [])

.controller( 'UseKpiCtrl', ['$scope', '$modalInstance', 'kpi', 'ModuleService' , function UseKpiCtrl( $scope, $modalInstance, kpi, ModuleService ) {

    $scope.kpi = kpi;

    $scope.relevantModules = [];

    var modules = ModuleService.getModulesFromKpiId(kpi.kpiAlias);

    _.each(modules, function(module) {
        $scope.relevantModules.push(module);
    });
              
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.useKPI = function() {
        $modalInstance.close(kpi);
    };

}]);



