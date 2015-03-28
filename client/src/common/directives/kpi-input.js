angular.module('idss-dashboard').directive('kpiInput', ['$compile', 'ModuleService', function($compile, ModuleService) {

    // a simple check to see if input is not misspelled (that will crash browser because of ng-include cant find template)
    var registeredInputs = ['number', 'inputGroup', 'slider', 'geojson', 'select', 'text', 'checkbox', 'radio', 'list', 'district-polygon'];
    var isRegisteredInput = function(input) {
        return _.find(registeredInputs, function(rI) {return rI === input.type;});
    };

    return {
        restrict: 'E',
        scope: {
            inputs: '=',
            process: '=', // used by some inputs
            kpialias: '=', 
            variantid: '=',
            moduleid: '=' 
        },
        link: function ( scope, element, attrs ) {

            var render = function() {

                // set template urls to all inputs to generate corresponding directive
                var setTemplateUrl = function(inputs) {
                    inputs = inputs || {};
                    for(var input in inputs) {
                        if(inputs.hasOwnProperty(input)) {
                            inputs[input].key = input;
                            if(isRegisteredInput(inputs[input])) {
                                inputs[input].template = 'directives/inputs/' + inputs[input].type + '.tpl.html';
                            } else {
                                inputs[input].template = 'directives/inputs/not-found.tpl.html';
                            }
                        }
                    }
                };

                setTemplateUrl(scope.inputs);

                console.log(scope.inputs);

                var template = '<form class="form-horizontal" role="form"><div ng-repeat="input in inputs | object2Array | orderBy:\'order\'" ng-include="input.template"></div></form>';

                element.html('').append( $compile( template )( scope ) );

            };

            scope.saveInput = function(input) {
                console.log(scope);
                console.log(input);
                var key = input.key;
                var inputWrapper = {};
                inputWrapper[key] = input;
                if(scope.moduleid && scope.kpialias && scope.inputs) {
                    ModuleService.saveModuleInput(scope.variantid, {
                        moduleId: scope.moduleid, 
                        kpiId: scope.kpialias,
                        input: inputWrapper
                    });
                }
            };

            // since it's not easy to store a radio input on the form
            // let the radio value be put (duplicated) on every radio button option..
            // TODO: find a nicer solution, wrap radio inputs in a parent object with name and selected value
            scope.setRadioInput = function(input) {
                console.log(input);
                for(var i in scope.inputs) {
                    if(scope.inputs.hasOwnProperty(i)) {
                        scope.inputs[i].value = input.referenceValue;
                    }
                }
                console.log(scope.inputs);
            };

            scope.$watch('inputs', function(newInputs, oldInputs) {
                console.log(newInputs, oldInputs);
                if(newInputs) {
                    render();
                }
            });
        }
    };


}]);

