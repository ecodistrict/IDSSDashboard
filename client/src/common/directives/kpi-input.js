angular.module('idss-dashboard').directive('kpiInput', ['$compile', function($compile) {

    // a simple check to see if input is not misspelled (that will crash browser because of ng-include cant find template)
    var registeredInputs = ['number', 'input-group', 'slider', 'geojson', 'select'];

    return {
        restrict: 'E',
        scope: {
            inputs: '=',
            variantid: '=', // optional, used by some inputs
            moduleid: '=' // optional, used by some inputs
        },
        link: function ( scope, element, attrs ) {

            var render = function() {

                // set template urls to all inputs to generate corresponding directive
                var setTemplateUrl = function(inputs) {
                    inputs = inputs || [];
                    _.each(inputs, function(input) {
                        if(_.find(registeredInputs, function(rI) {return rI === input.type;})) {
                            input.template = 'directives/inputs/' + input.type + '.tpl.html';
                        } else {
                            input.template = 'directives/inputs/not-found.tpl.html';
                        }
                    });
                };

                setTemplateUrl(scope.inputs);

                var template = '<div ng-repeat="input in inputs" ng-include="input.template"></div>';

                element.html('').append( $compile( template )( scope ) );

            };

            scope.$watchCollection('inputs', function(newInputs, oldInputs) {
                console.log(newInputs, oldInputs);
                if(newInputs && newInputs.length) {
                    console.log(newInputs);
                    render();
                }
            });
        }
    };


}]);

