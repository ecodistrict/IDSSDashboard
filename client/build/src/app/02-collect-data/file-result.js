angular.module( 'idss-dashboard.collect-data.module-input.file-result', [])

.controller( 'FileResultCtrl', ['$scope', '$modalInstance', 'data', 'ModuleService' , function FileResultCtrl( $scope, $modalInstance, data, ModuleService ) {

    $scope.data = data;

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.ok = function() {
        $modalInstance.close();
    };

}]);