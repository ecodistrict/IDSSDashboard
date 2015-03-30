angular.module('idss-dashboard').directive('kpiValueOutput', ['$compile', '$timeout', function($compile, $timeout) {

    return {
        restrict: 'E',
        scope: {
            kpi: '='
        },
        link: function ( scope, element, attrs ) {

            var elementWidth = element.width();

            var bad;
            var excellent;

            var render = function(output) {

                console.log(scope);

                scope.outputId = 'm_' + scope.kpi.kpiId + '_aggregated_kpi'; // generate a unique id
                scope.noDataMessage = "No overall KPI is given for this result";
                scope.tooltipFunction = function(){
                    return function(key, x, y, e, graph) {
                        if(x === 'Maximum') {
                            if(bad > excellent) {
                                x = 'bad';
                            } else {
                                x = 'excellent';
                            }
                        } else if (x === 'Minimum'){
                            if(bad > excellent) {
                                x = 'excellent';
                            } else {
                                x = 'bad';
                            }
                        } else if(x === 'Current') {
                            x = 'current';
                        }
                        return  '<p>' +  y + ' ' + scope.kpi.kpiUnit + ' is ' + x + '</p>';
                    };
                };

                bad = scope.kpi.kpiBad;
                excellent = scope.kpi.kpiExcellent;

                console.log(output);

                var kpiValues = {
                    "title": "KPI value in blue",
                    "subtitle": "Bad and excellent in grey",
                    "measures": [Math.round(output.value)],
                    "markers": [0]
                };

                //if(bad && excellent) {
                    kpiValues.ranges = [Math.min(bad, excellent), Math.max(bad, excellent)];
                //}

                scope.kpiValue = kpiValues;

                console.log(scope.kpiValue);
                console.log(scope);
                var template = ['<nvd3-bullet-chart ',
                            'data="kpiValue" ',
                            'id="{{outputId}}" ',
                            'noData="{{noDataMessage}}" ',
                            'interactive="true" ',
                            'tooltips="true" ',
                            'tooltipcontent="tooltipFunction()" ',
                            'margin="{left:140,top:30,bottom:30,right:10}" ',
                            'width="600" ',
                            'height="100"> ',
                    '<svg></svg>',
                '</nvd3-bullet-chart>'].join('');

                element.html('').append( $compile( template )( scope ) );

                setKpiWidth();


            };

            scope.$watchCollection('kpi.outputs', function(newOutputs, oldOutputs) {
                // ignore first run, when undefined
                if(newOutputs && newOutputs.length) {
                    elementWidth = 0; 
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

            // scope.x = function() {
            //     return function(d) {
            //       return d.type;
            //     };
            // };

            // scope.y = function() {
            //     return function(d) {
            //       return d.value;
            //     };
            // };

            // TODO: this is very hacky, and the function is executed a lot of times! 
            // The problem is to get the width of the element after the DOM is ready (try controller) 
            var setKpiWidth = function() {

                var offset = 40;

                //scope.kpiWidth = 400;

                if(!elementWidth) {

                     $timeout(function() {

                        elementWidth = element.width();
                        console.log(offset, elementWidth);
                        console.log($(element).width());
                        scope.kpiWidth = elementWidth - offset * 2;

                     }, 100);

                } else {
                    scope.kpiWidth = elementWidth - offset * 2;
                }

            };

        }
    };

    


}]);



