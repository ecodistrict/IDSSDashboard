angular.module('idss-dashboard').directive('kpiValueOutputSingle', ['$compile', '$timeout', function($compile, $timeout) {

    return {
        restrict: 'E',
        scope: {
            kpi: '=',
            bad: '@',
            excellent: '@',
            unit: '@',
            index: '@',
            moduleid: '@'
        },
        link: function ( scope, element, attrs ) {

            // var elementWidth = element.width();

            // console.log(scope.kpi);
            // console.log(scope.bad);
            // console.log(scope.excellent);
            // console.log(scope.index);
            // console.log(scope.unit);

            // var render = function() {

            //     scope.outputId = 'm_' + scope.moduleid + '_' + scope.index; // generate a unique id
            //     scope.noDataMessage = "No overall KPI is given for this result";
            //     scope.tooltipFunction = function(){
            //         return function(key, x, y, e, graph) {
            //             if(x === 'Maximum') {
            //                 if(scope.bad > scope.excellent) {
            //                     x = 'bad';
            //                 } else {
            //                     x = 'excellent';
            //                 }
            //             } else if (x === 'Minimum'){
            //                 if(scope.bad > scope.excellent) {
            //                     x = 'excellent';
            //                 } else {
            //                     x = 'bad';
            //                 }
            //             } else if(x === 'Current') {
            //                 x = 'current';
            //             }
            //             return  '<p>' +  y + ' ' + scope.unit + ' is ' + x + '</p>';
            //         };
            //     };

            //     var data = {
            //         //"title": "KPI value in blue",
            //         //"subtitle": "Bad and excellent in grey",
            //         "measures": [Math.round(scope.kpi.kpiValue)],
            //         "markers": [0]
            //     };

            //     //if(scope.bad && scope.excellent) {
            //         data.ranges = [Math.min(scope.bad, scope.excellent), Math.max(scope.bad, scope.excellent)];
            //     //}

            //     scope.data = data;

            //     console.log(scope.data);

            //     var template = ['<nvd3-bullet-chart ',
            //                 'data="data" ',
            //                 'id="{{outputId}}" ',
            //                 'noData="{{noDataMessage}}" ',
            //                 'interactive="true" ',
            //                 'tooltips="true" ',
            //                 'tooltipcontent="tooltipFunction()" ',
            //                 'margin="{left:20,top:10,bottom:10,right:10}" ',
            //                 'width="600" ',
            //                 'height="40"> ',
            //         '<svg></svg>',
            //     '</nvd3-bullet-chart>'].join('');

            //     element.html('').append( $compile( template )( scope ) );



            // };

            // render();

        }
    };

    


}]);



