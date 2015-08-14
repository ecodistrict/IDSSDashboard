angular.module('idss-dashboard').directive('kpiValueOutputSlider', ['$compile', function($compile) {

    return {
        restrict: 'E',
        scope: {
            kpi: '='
        },
        link: function ( scope, element, attrs ) {

            var bad;
            var excellent;

            var render = function(output) {

                // test values
                scope.testOptions = {
                    min: 5,
                    max: 100,
                    step: 5,
                    precision: 2,
                    orientation: 'horizontal',  // vertical
                    handle: 'round', //'square', 'triangle' or 'custom'
                    tooltip: 'show', //'hide','always'
                    tooltipseparator: ':',
                    tooltipsplit: false,
                    enabled: true,
                    naturalarrowkeys: false,
                    range: false,
                    ngDisabled: false,
                    reversed: false,
                    sliderId: "test",
                    value: 50
                };

                scope.range = true;

                scope.model = {
                    first: 0,
                    second: [],
                    third: 0,
                    fourth: 0,
                    fifth: 0,
                    sixth: 0,
                    seventh: 0,
                    eighth: 0,
                    ninth: 0,
                    tenth: 0
                };

                scope.value = {
                    first: scope.testOptions.min + scope.testOptions.step,
                    second: [scope.testOptions.min + scope.testOptions.step, scope.testOptions.max - scope.testOptions.step],
                    third: 0,
                    fourth: 0,
                    fifth: 0,
                    sixth: 0,
                    seventh: 0,
                    eighth: 0,
                    ninth: 0,
                    tenth: 0
                };

                scope.prefix = 'Current value: ';
                scope.suffix = '%';

                scope.formatterFn = function (value) {
                    return scope.prefix + value + scope.suffix;
                };

                scope.delegateEvent = null;
                scope.slideDelegate = function (value, event) {
                    scope.delegateEvent = event;
                };

                var template = '<slider slider-id="testOptions.sliderId"'+
            '        ng-model="model.first"'+
            '        value="value.first"'+
            '        min="testOptions.min"'+
            '        max="testOptions.max"'+
            '        step="testOptions.step"'+
            '        range="testOptions.range"'+
            '        precision="testOptions.precision"'+
            '        reversed="{{ testOptions.reversed }}"'+
            '        orientation="{{ testOptions.orientation }}"'+
            '        handle="{{ testOptions.handle }}"'+
            '        enabled="{{ testOptions.enabled }}"'+
            '        ng-disabled="{{ testOptions.ngDisabled }}"'+
            '        naturalarrowkeys="{{ testOptions.naturalarrowkeys }}">'+
            '    If you can see this then slider did not get compiled by Angular.'+
            '    Check that all necessary files are included, did you run "bower install"?'+
            '</slider>';

                element.html('').append( $compile(template)(scope) );


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





// angular.module('idss-dashboard').directive('kpiValueOutput', ['$compile', function($compile) {

//     return {
//         restrict: 'E',
//         scope: {
//             kpi: '='
//         },
//         link: function ( scope, element, attrs ) {

//             var bad;
//             var excellent;

//             var render = function(output) {

//                 //console.log(output);
//                 console.log(scope.kpi);

//                 scope.kpi.kpiValue = output.value;

//                 scope.outputId = 'm-' + scope.kpi.alias + '-aggregated-kpi'; // generate a unique id
//                 scope.noDataMessage = "No overall KPI is given for this result";
//                 bad = scope.kpi.bad;
//                 excellent = scope.kpi.excellent;
//                 if(!bad || !excellent) {
//                     scope.noDataMessage = "Excellent and/or bad values where not defined when configuring KPIs";
//                 }

//                 //console.log(output);

//                 var kpiValues = {
//                     "title": "KPI value in blue",
//                     "subtitle": "Bad and excellent in grey",
//                     "measures": [Math.round(output.value)],
//                     "markers": [0]
//                 };

//                 if((bad || bad === 0) && (excellent || excellent === 0)) {
//                     kpiValues.ranges = [Math.min(bad, excellent), Math.max(bad, excellent)];
//                 }

//                 scope.kpiValue = kpiValues;
//                 console.log(kpiValues);
//                 //scope.kpiValue = output.value;

//                 // test values
//                 scope.testOptions = {
//                     min: 5,
//                     max: 100,
//                     step: 5,
//                     precision: 2,
//                     orientation: 'horizontal',  // vertical
//                     handle: 'round', //'square', 'triangle' or 'custom'
//                     tooltip: 'show', //'hide','always'
//                     tooltipseparator: ':',
//                     tooltipsplit: false,
//                     enabled: true,
//                     naturalarrowkeys: false,
//                     range: false,
//                     ngDisabled: false,
//                     reversed: false,
//                     sliderId: "test",
//                     value: 50
//                 };

//                 scope.range = true;

//                 scope.model = {
//                     first: 0,
//                     second: [],
//                     third: 0,
//                     fourth: 0,
//                     fifth: 0,
//                     sixth: 0,
//                     seventh: 0,
//                     eighth: 0,
//                     ninth: 0,
//                     tenth: 0
//                 };

//                 scope.value = {
//                     first: scope.testOptions.min + scope.testOptions.step,
//                     second: [scope.testOptions.min + scope.testOptions.step, scope.testOptions.max - scope.testOptions.step],
//                     third: 0,
//                     fourth: 0,
//                     fifth: 0,
//                     sixth: 0,
//                     seventh: 0,
//                     eighth: 0,
//                     ninth: 0,
//                     tenth: 0
//                 };

//                 scope.prefix = 'Current value: ';
//                 scope.suffix = '%';

//                 scope.formatterFn = function (value) {
//                     return scope.prefix + value + scope.suffix;
//                 };

//                 scope.delegateEvent = null;
//                 scope.slideDelegate = function (value, event) {
//                     scope.delegateEvent = event;
//                 };

//                 var template = '<p>' +
//     '    <label for="sliderId">Slider Id:</label>' +
//     '    <input id="sliderId" type="text" ng-model="testOptions.sliderId">'+
//     '    <label for="modelValue">Slider Value in ng-model:</label>'+
//     '    <input id="modelValue" type="range" ng-model="model.first" min="testOptions.min" step="testOptions.step" max="testOptions.max">'+
//     '    <input type="number" ng-model="model.first" class="form-control">'+
//     '    <label for="value">Value:</label>'+
//     '    <input id="value" type="number" ng-model="value.first" class="form-control">'+
//     '    <label for="min">Min:</label>'+
//     '    <input id="min" type="number" ng-model="testOptions.min" class="form-control">'+
//     '    <label for="max">Max:</label>'+
//     '    <input id="max" type="number" ng-model="testOptions.max" class="form-control">'+
//     '    <label for="step">Step:</label>'+
//     '    <input id="step" type="number" ng-model="testOptions.step" class="form-control">'+
//     '    <label for="range">Range:</label>'+
//     '    <input id="range" type="checkbox" ng-model="testOptions.range" class="form-control">'+
//     '    <label for="precision">Precision:</label>'+
//     '    <input id="precision" type="number" ng-model="testOptions.precision" class="form-control">'+
//     '    <label for="reversed">Reversed:</label>'+
//     '    <input id="reversed" type="checkbox" ng-model="testOptions.reversed" class="form-control">'+
//     '    <label for="orientation">Orientation:</label>'+
//     '    <select id="orientation" ng-model="testOptions.orientation" class="form-control">'+
//     '        <option value="horizontal">Horizontal</option>'+
//     '        <option value="vertical">Vertical</option>'+
//     '    </select>'+
//     '    <label for="handle">Handle:</label>'+
//     '    <select id="handle" ng-model="testOptions.handle" class="form-control">'+
//     '        <option value="round">Round</option>'+
//     '        <option value="square">Square</option>'+
//     '        <option value="triangle">Triangle</option>'+
//     '        <option value="custom">Custom</option>'+
//     '    </select>'+
//     '    <label for="enabled">Enabled:</label>'+
//     '    <input id="enabled" type="checkbox" ng-model="testOptions.enabled" class="form-control">'+
//     '    <label for="ngDisabled">ngDisabled:</label>'+
//     '    <input id="ngDisabled" type="checkbox" ng-model="testOptions.ngDisabled" class="form-control">'+
//     '    <label for="naturalarrowkeys">Natural arrow keys:</label>'+
//     '    <input id="naturalarrowkeys" type="checkbox" ng-model="testOptions.naturalarrowkeys" class="form-control">'+
//     '</p>'+
//     'Slider using tags<br>'+
//     '<slider slider-id="testOptions.sliderId"'+
//     '        ng-model="model.first"'+
//     '        value="value.first"'+
//     '        min="testOptions.min"'+
//     '        max="testOptions.max"'+
//     '        step="testOptions.step"'+
//     '        range="testOptions.range"'+
//     '        precision="testOptions.precision"'+
//     '        reversed="{{ testOptions.reversed }}"'+
//     '        orientation="{{ testOptions.orientation }}"'+
//     '        handle="{{ testOptions.handle }}"'+
//     '        enabled="{{ testOptions.enabled }}"'+
//     '        ng-disabled="{{ testOptions.ngDisabled }}"'+
//     '        naturalarrowkeys="{{ testOptions.naturalarrowkeys }}">'+
//     '    If you can see this then slider did not get compiled by Angular.'+
//     '    Check that all necessary files are included, did you run "bower install"?'+
//     '</slider>';
// //     '<br><br>'+
// //     '<p>'+
// //     '    <label for="tooltipseparator">Tooltip separator:</label>'+
// //     '    <input id="tooltipseparator" type="text" ng-model="testOptions.tooltipseparator" class="form-control">'+
// //     '    <label for="tooltipsplit">Tooltip split:</label>'+
// //     '    <input id="tooltipsplit" type="checkbox" ng-model="testOptions.tooltipsplit" class="form-control">'+
// //     '</p>'+
// //     'Range slider<br>'+
// //     '<span slider'+
// //     '      slider-id="rangeSlider"'+
// //     '      ng-model="model.second"'+
// //     '      value="value.second"'+
// //     '      min="testOptions.min"'+
// //     '      max="testOptions.max"'+
// //     '      range="range"'+
// //     '      tooltipseparator="{{ testOptions.tooltipseparator }}"'+
// //     '      tooltipsplit="{{ testOptions.tooltipsplit }}">'+
// //     '</span>'+
// //     'Model: {{model.second | json}}<br>'+
// //     'Value: {{value.second | json}}<br>'+
// //     '<br><br>'+
// //     '<p>'+
// //     '    <label for="tooltip">Tooltip:</label>'+
// //     '    <select id="tooltip" ng-model="testOptions.tooltip" class="form-control">'+
// //     '        <option value="show">Show</option>'+
// //     '        <option value="hide">Hide</option>'+
// //     '        <option value="always">Always</option>'+
// //     '    </select>'+
// //     '    <label for="formatter_prefix">Formatter prefix:</label>'+
// //     '    <input id="formatter_prefix" type="text" ng-model="prefix" class="form-control">'+
// //     '    <label for="formatter_sufffix">Formatter suffix:</label>'+
// //     '    <input id="formatter_sufffix" type="text" ng-model="suffix" class="form-control">'+
// //     '</p>'+
// //     'Slider with configurable tooltip<br>'+
// //     '<slider slider-id="tooltipSlider"'+
// //     '        ng-model="model.third"'+
// //     '        precision="{{ testOptions.precision }}"'+
// //     '        tooltip="{{ testOptions.tooltip }}"'+
// //     '        formatter="formatterFn"'+
// //     '        >'+
// //     '</slider>'+
// //     'Model: {{model.third}}<br>'+
// //     '<br><br>'+
// //     'Slider using event expressions'+
// //     '<slider ng-model="model.fourth"'+
// //     '        on-start-slide="status=\'started\'"'+
// //     '        on-slide="status=$event.type"'+
// //     '        on-stop-slide="status=\'stopped\'"'+
// //     '        >'+
// //     '</slider>'+
// //     'Model: {{model.fourth}}<br>'+
// //     'Status: {{status}}<br>'+
// //     '<br><br>'+
// //     'Slider using event callbacks'+
// //     '<span slider'+
// //     '      ng-model="model.fifth"'+
// //     '      on-start-slide="slideDelegate(value, $event)"'+
// //     '      on-slide="slideDelegate(value, $event)"'+
// //     '      on-stop-slide="slideDelegate(value, $event)"'+
// //     '        >'+
// //     '</span>'+
// //     'Model: {{model.fifth}}<br>'+
// //     'Event type: {{delegateEvent.type}}<br>'+
// //     '<br><br>'+
// // ''+
// //     'Slider using mixed expressions and callbacks'+
// //     '<span slider'+
// //     '      ng-model="model.sixth"'+
// //     '      on-start-slide="status2=\'started\'"'+
// //     '      on-slide="slideDelegate(value)"'+
// //     '      on-stop-slide="status2=$event.type; slideDelegate(value, $event)"'+
// //     '        >'+
// //     '</span>'+
// //     'Model: {{model.sixth}}<br>'+
// //     'Status: {{status2}}<br>'+
// //     'Event type: {{delegateEvent.type}}<br>'+
// //     '<br><br>'+
// //     'Updates model on slide event by default'+
// //     '<slider ng-model="model.seventh"></slider>'+
// //     'Model: {{model.seventh}}<br>'+
// //     '<br><br>'+
// //     'Updates model only on slideStop event'+
// //     '<slider ng-model="model.eighth" updateevent="slideStop"></slider>'+
// //     'Model: {{model.eighth}}<br>'+
// //     '<br><br>'+
// //     'Updates model on slideStart and slideStop'+
// //     '<span slider ng-model="model.ninth"></span>'+
// //     'Model: {{model.ninth}}<br>'+
// //     '<br><br>'+
// //     'Updates model on all events'+
// //     '<span slider ng-model="model.tenth"></span>'+
// //     'Model: {{model.tenth}};';

// //var template = '<slider ng-model="kpi.kpiValue" min="testOptions.min" step="testOptions.step" max="testOptions.max" value="testOptions.value"></slider>';

//                 //var template = ['<div id="{{outputId}}">Value: {{kpiValue}}, Bad: {{kpi.bad}}, Excellent: {{kpi.excellent}}</div>'].join('');
//                 // var template = ['<nvd3-bullet-chart ',
//                 //             'data="kpiValue" ',
//                 //             'id="{{outputId}}" ',
//                 //             'noData="{{noDataMessage}}" ',
//                 //             //'interactive="true" ',
//                 //             //'tooltips="true" ',
//                 //             //'tooltipcontent="tooltipFunction()" ',
//                 //             'margin="{left:140,top:30,bottom:30,right:10}" ',
//                 //             'width="600" ',
//                 //             'height="100"> ',
//                 //     '<svg></svg>',
//                 // '</nvd3-bullet-chart>'].join('');

//                 element.html('').append( $compile(template)(scope));

//             };

//             scope.$watchCollection('kpi.outputs', function(newOutputs, oldOutputs) {

//                 // ignore first run, when undefined
//                 if(newOutputs && newOutputs.length) {
//                     // if output changed
//                     if(oldOutputs && oldOutputs.length === newOutputs.length) {
//                         _.each(newOutputs, function(output, i) {
//                             if(output !== oldOutputs[i]) {
//                                 console.log(output.type);
//                                 if(output.type === 'kpi') {
//                                     render(output);
//                                 }
//                             }
//                         });
//                     } else {
//                         // TODO: bad solution, fix this
//                         // if output was added
//                         _.each(newOutputs, function(output, i) {
//                             if(output.type === 'kpi') {
//                                 render(output);
//                             }
//                         });

//                     }
//                 }
//             });

//             if(scope.kpi.outputs) {
//                 _.each(scope.kpi.outputs, function(output) {
//                     if(output.type === 'kpi') {
//                         render(output);
//                     }
//                 });
//             }

//         }
//     };

    


// }]);



