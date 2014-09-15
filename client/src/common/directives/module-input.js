angular.module('idss-dashboard').directive('moduleInput', ['$compile', function($compile) {

    return {
        restrict: 'E',
        scope: {
            moduleInputs: '='
        },
        link: function ( scope, element, attrs ) {

            console.log(scope.moduleInputs);

            // set template links
            _.each(scope.moduleInputs, function(input) {
                input.template = 'directives/module-inputs/' + input.type + '.tpl.html';
            });

            // TODO: How to dynamically add directives depending on type
            // TODO: create input-group recursively
            var template =
            '<div ng-repeat="input in moduleInputs" ng-include="input.template">' + 
                // '{{input.type}}' + 
                // '<module-input-text ng-if="input.type == \'text\'" input="input">' + 
                // '<module-input-number ng-if="input.type == \'number\'" input="input">' + 
                // '<module-input-input-group ng-if="input.type == \'input-group\'" input="input">' + 
                //'<module-input module-inputs="{{input.inputs}}>' +  
            '</div>';

            element.html('').append( $compile( template )( scope ) );
        }
    };


}]);

