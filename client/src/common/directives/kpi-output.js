angular.module('idss-dashboard').directive('kpiOutput', ['$compile', '$timeout', function($compile, $timeout) {

    var registeredOutputs = [];
    // The reserved outputs are rendered in other places
    var reservedOutputs = ['kpi', 'geojson', 'district-polygon'];

    return {
        restrict: 'E',
        scope: {
            outputs: '=',
            inputs: '=', 
            kpiunit: '='
        },
        link: function ( scope, element, attrs ) {

            var elementWidth = element.width();

            // var bad;
            // var excellent;

            var render = function() {

                // set template urls to all outputs to generate corresponding directive
                var prepareOutputs = function(outputs) {
                    outputs = outputs || [];
                    _.each(outputs, function(output) {
                        if(_.find(registeredOutputs, function(rO) {return rO === output.type;})) {
                            output.template = 'directives/outputs/' + output.type + '.tpl.html';
                        } else if(_.find(reservedOutputs, function(rO) {return rO === output.type;})) {
                            // skip this, rendered in other place
                        } else {
                            output.template = 'directives/outputs/not-found.tpl.html';
                        }
                    });
                };

                prepareOutputs(scope.outputs);
                
                var template = '<div ng-repeat="output in outputs" ng-include="output.template"></div>';

                element.html('').append( $compile( template )( scope ) );

            };

            // for updating the outputs after calculation, the length change cannot be checked because it should be the same
            // this should be per module!
            scope.$watchCollection('outputs', function(newOutputs, oldOutputs) {
                // ignore first run, when undefined
                if(newOutputs && newOutputs.length) {
                    elementWidth = 0; 
                    // _.each(newOutputs, function(output, i) {
                    //     if(output !== oldOutputs[i]) {
                    //         console.log(output.type);
                    //         if(output.type === 'kpi') {
                    //             //initKpiValue(output);
                    //         }
                    //         // check type and prepare data, this is per module so some function can run at this level (if kpi type is used once!)
                            
                    //     }
                    // });
                    render();
                    console.log(newOutputs);
                    // hack to let getWidth function to recalculate width, this should not be necessary but will do for now
                    
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
            // setKpiWidth = function() {

            //     var offset = 40;

            //     //scope.kpiWidth = 400;

            //     if(!elementWidth) {

            //          $timeout(function() {

            //             elementWidth = element.width();
            //             console.log(offset, elementWidth);
            //             console.log($(element).width());
            //             scope.kpiWidth = elementWidth - offset * 2;

            //          }, 100);

            //     } else {
            //         scope.kpiWidth = elementWidth - offset * 2;
            //     }

            // };

            // var getKpiSettings = function() {
            //     if(scope.inputs) {
            //         console.log(scope.inputs);
            //         var kpiScores = _.find(scope.inputs, function(input) {return input.id === 'kpi-scores';});
            //         if(kpiScores && kpiScores.inputs) {
            //             // assume order
            //             excellent = kpiScores.inputs[0].value;
            //             bad = kpiScores.inputs[1].value;
            //         }
            //     }
            // };

            // var setKpiData = function(kpiValue) {

            //     console.log(kpiValue);

            //     getKpiSettings();

            //     var kpiValues = {
            //         "title": "KPI value in blue",
            //         "subtitle": "Bad and excellent in grey",
            //         "measures": [kpiValue],
            //         "markers": [0]
            //     };

            //     if(bad && excellent) {
            //         kpiValues.ranges = [Math.min(bad, excellent), Math.max(bad, excellent)];
            //     }

            //     scope.kpiValue = kpiValues;

            // };

            //scope.data = [{category: "test", value: 5},{category: "test", value: 5},{category: "test2", value: 5},{category: "test", value: 5}];


        }
    };

    


}]);



