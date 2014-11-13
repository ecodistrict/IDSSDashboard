angular.module('idss-dashboard').directive('kpiOutput', ['$compile', function($compile) {

    // this check could be better implemented, maybe look through folder on server and generate this list from file names
    var registeredOutputs = ['osg'];

    return {
        restrict: 'E',
        scope: {
            outputs: '='
        },
        link: function ( scope, element, attrs ) {

            var render = function() {

                // set template urls to all outputs to generate corresponding directive
                var prepareOutputs = function(outputs) {
                    outputs = outputs || [];
                    _.each(outputs, function(output) {
                        if(_.find(registeredOutputs, function(rO) {return rO === output.type;})) {
                            // first look for common output types
                            if(output.type === 'geojson') {
                                scope.geojsonOutputs.push(output);
                            } else {
                                // if not common, it should be one of the specific individual outputs
                                output.template = 'directives/outputs/' + output.type + '.tpl.html';
                            }
                        } else {
                            output.template = 'directives/outputs/not-found.tpl.html';
                        }
                    });
                };

                prepareOutputs(scope.outputs);
                
                var template = '<div ng-repeat="output in outputs" ng-include="output.template"></div>';

                element.html('').append( $compile( template )( scope ) );

            };

            scope.$watchCollection('outputs', function(newOutputs, oldOutputs) {
                console.log(newOutputs, oldOutputs);
                if(newOutputs && newOutputs.length) {
                    console.log(newOutputs);
                    render();
                }
            });
        }
    };


}]);

