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

                scope.outputId = 'dfgdf'; // generate a unique id
                scope.noDataMessage = "No overall KPI is given for this result";
                scope.tooltipFunction = function(){
                    return function(key, x, y, e, graph) {
                        if(x === 'Maximum') {
                            x = 'excellent';
                        } else if (x === 'Minimum'){
                            x = 'bad';
                        } else if(x === 'Current') {
                            x = 'current';
                        }
                        return  '<p>' +  y + ' ' + scope.kpi.kpiUnit + ' is ' + x + '</p>';
                    };
                };

                if(scope.kpi.inputs) {
                    console.log(scope.kpi.inputs);
                    var kpiScores = _.find(scope.kpi.inputs, function(input) {return input.id === 'kpi-scores';});
                    if(kpiScores && kpiScores.inputs) {
                        // assume order
                        excellent = kpiScores.inputs[0].value;
                        bad = kpiScores.inputs[1].value;
                    }
                }

                var kpiValues = {
                    "title": "KPI value in blue",
                    "subtitle": "Bad and excellent in grey",
                    "measures": [output.value],
                    "markers": [0]
                };

                if(bad && excellent) {
                    kpiValues.ranges = [Math.min(bad, excellent), Math.max(bad, excellent)];
                }

                scope.kpiValue = kpiValues;

                console.log(scope.kpiValue);

                var template = ['<nvd3-bullet-chart ',
                            'data="kpiValue" ',
                            'id="outputId" ',
                            'noData="noDataMessage" ',
                            'interactive="true" ',
                            'tooltips="true" ',
                            'tooltipcontent="tooltipFunction()" ',
                            'margin="{left:140,top:30,bottom:30,right:10}" ',
                            'width="{{kpiWidth}}" ',
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



