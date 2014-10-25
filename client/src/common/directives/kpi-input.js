angular.module('idss-dashboard').directive('kpiInput', ['$compile', function($compile) {

    return {
        restrict: 'E',
        scope: {
            inputs: '='
        },
        link: function ( scope, element, attrs ) {

            console.log(scope.inputs);

            // set template urls to all inputs to generate corresponding directive
            var setTemplateUrl = function(inputs) {
                inputs = inputs || [];
                _.each(inputs, function(input) {
                  input.template = 'directives/inputs/' + input.type + '.tpl.html';
                  // skip recursion here, do that in respective child
                  // if(input.inputs) {
                  //   setTemplateUrl(input.inputs);
                  // }
                });
            };

            setTemplateUrl(scope.inputs);

            var template = '<div ng-repeat="input in inputs" ng-include="input.template"></div>';
            // skip recursion here, do that in respective child
            //(scope.inputs.inputs ? '<kpi-input inputs="inputs">' : '');

            element.html('').append( $compile( template )( scope ) );

        }
    };


}]);

