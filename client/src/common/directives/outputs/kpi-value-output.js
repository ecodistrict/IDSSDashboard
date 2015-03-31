angular.module('idss-dashboard').directive('kpiValueOutput', ['$compile', '$timeout', function($compile, $timeout) {

    return {
        restrict: 'E',
        scope: {
            kpi: '='
        },
        link: function ( scope, element, attrs ) {

            var render = function(output) {

                console.log(output);
                console.log(scope.kpi);

                scope.outputId = 'm_' + scope.kpi.alias + '_aggregated_kpi'; // generate a unique id
                scope.noDataMessage = "No overall KPI is given for this result";
                scope.kpiValue = output.value;

                var template = ['<div id="{{outputId}}">Value: {{kpiValue}}, Bad: {{kpi.bad}}, Excellent: {{kpi.excellent}}</div>'].join('');

                element.html('').append( $compile( template )( scope ) );

            };

            scope.$watchCollection('kpi.outputs', function(newOutputs, oldOutputs) {

                // ignore first run, when undefined
                if(newOutputs && newOutputs.length) {
                    // if output changed
                    if(oldOutputs && oldOutputs.length === newOutputs.length) {
                        _.each(newOutputs, function(output, i) {
                            if(output !== oldOutputs[i]) {
                                console.log(output.type);
                                if(output.type === 'kpi') {
                                    render(output);
                                }
                            }
                        });
                    } else {
                        // TODO: bad solution, fix this
                        // if output was added
                        _.each(newOutputs, function(output, i) {
                            if(output.type === 'kpi') {
                                render(output);
                            }
                        });

                    }
                }
            });

            if(scope.kpi.outputs) {
                _.each(scope.kpi.outputs, function(output) {
                    if(output.type === 'kpi') {
                        render(output);
                    }
                });
            }

        }
    };

    


}]);



