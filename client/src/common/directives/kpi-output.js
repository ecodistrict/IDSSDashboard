angular.module('idss-dashboard').directive('kpiOutput', ['$compile', '$timeout', function($compile, $timeout) {

    // this check could be better implemented, maybe look through folder on server and generate this list from file names
    var registeredOutputs = ['kpi'];

    return {
        restrict: 'E',
        scope: {
            outputs: '='
        },
        link: function ( scope, element, attrs ) {

            var elementWidth = element.width();

            console.log(elementWidth);

            var render = function() {

                // set template urls to all outputs to generate corresponding directive
                var prepareOutputs = function(outputs) {
                    outputs = outputs || [];
                    _.each(outputs, function(output) {
                        if(_.find(registeredOutputs, function(rO) {return rO === output.type;})) {
                            // // first look for common output types
                            // if(output.type === 'geojson') {
                            //     scope.geojsonOutputs.push(output);
                            // } else {
                            //     // if not common, it should be one of the specific individual outputs
                            output.template = 'directives/outputs/' + output.type + '.tpl.html';
                            //}
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
                var oldOutputsLength = oldOutputs ? oldOutputs.length : 0;
                if(newOutputs && newOutputs.length) {
                    console.log(newOutputs);
                    // hack to let getWidth function to recalculate width, this should not be necessary but will do for now
                    elementWidth = 0; 
                    render();
                }
            });

            scope.x = function() {
                return function(d) {
                  return d.type;
                };
              };

            scope.y = function() {
                return function(d) {
                  return d.value;
                };
              };

            // TODO: this is very hacky, and the function is executed a lot of times! 
            // The problem is to get the width of the element after the DOM is ready (try controller) 
            scope.getWidth = function() {

                var offset = 40;

                if(!elementWidth) {

                    $timeout(function() {

                        elementWidth = element.width();
                        console.log(offset, elementWidth);
                        console.log($(element).width());
                        return elementWidth - offset * 2;

                    }, 100);

                } else {
                    return elementWidth - offset * 2;
                }

            };

            scope.data = [{category: "test", value: 5},{category: "test", value: 5},{category: "test2", value: 5},{category: "test", value: 5}];


        }
    };

    


}]);



