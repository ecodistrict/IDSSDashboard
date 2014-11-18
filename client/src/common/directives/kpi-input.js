angular.module('idss-dashboard').directive('kpiInput', ['$compile', 'ModuleService', function($compile, ModuleService) {

    // a simple check to see if input is not misspelled (that will crash browser because of ng-include cant find template)
    var registeredInputs = ['number', 'input-group', 'slider', 'geojson', 'select', 'text', 'checkbox', 'list', 'district-polygon'];

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
                    inputs = inputs || [];
                    _.each(inputs, function(input) {
                        if(_.find(registeredInputs, function(rI) {return rI === input.type;})) {
                            input.template = 'directives/inputs/' + input.type + '.tpl.html';
                        } else {
                            input.template = 'directives/inputs/not-found.tpl.html';
                        }
                    });
                };

                setTemplateUrl(scope.inputs);

                var template = '<div ng-repeat="input in inputs" ng-include="input.template"></div>';

                element.html('').append( $compile( template )( scope ) );

            };

            scope.saveInput = function(input) {
                if(scope.moduleId && scope.kpialias && scope.inputs) {
                    ModuleService.saveModuleInput(scope.variantid, {
                        moduleId: scope.moduleid, 
                        kpiAlias: scope.kpialias,
                        inputs: [input]
                    });
                }
            };

            console.log(scope.moduleid);
            scope.$watch('moduleid', function(newid, oldid) {
                console.log(newid, oldid);
            });

            scope.$watchCollection('inputs', function(newInputs, oldInputs) {
                if(newInputs && newInputs.length) {
                    console.log(newInputs);
                    render();
                }
            });
        }
    };


}]);

