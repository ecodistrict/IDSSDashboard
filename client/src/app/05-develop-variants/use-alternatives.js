angular.module( 'idss-dashboard.develop-variants.use-alternatives', [])

.controller( 'UseAlternativeCtrl', ['$scope', '$modalInstance', 'module', 'ModuleService' , function UseAlternativeCtrl( $scope, $modalInstance, module, ModuleService ) {

    $scope.module = module;

    console.log(module);

    // set template urls to all inputs to generate corresponding directive
    var setTemplateUrl = function(inputs) {
        _.each(inputs, function(input) {
            input.template = 'directives/module-inputs/' + input.type + '.tpl.html';
            if(input.inputs) {
                setTemplateUrl(input.inputs);
            }
        });
    };

    $scope.setSelectedAlternative = function(alternative) {
        $scope.module.selectedAlternative = alternative;
    };

    setTemplateUrl(module.alternatives);

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.saveAlternative = function() {
        $modalInstance.close($scope.module);
    };

}]);



