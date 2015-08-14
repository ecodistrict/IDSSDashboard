angular.module('idss-dashboard').directive('kpiValueOutputChart', ['$compile', '$timeout', function($compile, $timeout) {

    return {
        restrict: 'E',
        scope: {
            kpi: '='
        },
        link: function ( scope, element, attrs ) {

            var kpi = scope.kpi;
            console.log(kpi);

            var render = function() {

                if(!kpi.value) {
                    console.log('kpi value did not exist');
                    return;
                }

                kpi.bad = -20;

                element.append('<div id="chart-'+ kpi.alias +  '" class="with-3d-shadow with-transitions">'+
                    '<svg></svg>'+
                '</div>');

                var long_short_data = [
                    {
                        key: 'Bad: ' + kpi.bad + " " + kpi.unit,
                        values: [
                            {
                                "label" : "Bad",
                                "value" : kpi.bad
                            }
                        ]
                    },
                    {
                        key: 'Excellent: ' + kpi.excellent + " " + kpi.unit,
                        values: [
                            {
                                "label" : "Excellent",
                                "value" : kpi.excellent
                            }
                        ]
                    },
                    {
                        key: 'KPI value: ' + kpi.value + " " + kpi.unit,
                        values: [
                            {
                                "label" : "KPI value",
                                "value" : kpi.value
                            }
                        ]
                    }
                ];
                var chart;
                nv.addGraph(function() {
                    chart = nv.models.multiBarHorizontalChart()
                        .x(function(d) { return d.label; })
                        .y(function(d) { return d.value; })
                        .duration(250)
                        .stacked(false)
                        .showValues(true)
                        .showControls(false)
                        .tooltips(false)
                        .barColor(["#00FF00"])
                        .color(["#FF0000","#00FF00","#0000FF"])
                        //.groupSpacing(0.1)
                        //.showLegend(false)
                        //.yDomain([kpi.bad, kpi.value, kpi.excellent]);
                        //.yRange([kpi.bad, kpi.value, kpi.excellent])
                        .forceY([0, kpi.bad, kpi.value, kpi.excellent]);
                    chart.color(function (d, i) {
                        var colors = d3.scale.category20().range().slice(10);
                        return colors[i % colors.length-1];
                    });
                    chart.yAxis.tickFormat(d3.format(',.2f'));
                    d3.select('#chart-' + kpi.alias + ' svg')
                        .datum(long_short_data)
                        .call(chart);
                    nv.utils.windowResize(chart.update);
                    chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });
                    chart.state.dispatch.on('change', function(state){
                        nv.log('state', JSON.stringify(state));
                    });
                    return chart;
                });
            };

            render();

            kpi.value = 2;

            scope.$watch('kpi.value', function(newValue, oldValue) {
                console.log(newValue, oldValue);
                render();
            });

        }
    };

    


}]);



