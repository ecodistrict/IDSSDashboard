angular.module('idss-dashboard').directive('moduleInput', ['$compile', function($compile) {

    return {
        restrict: 'E',
        link: function ( scope, element, attrs ) {

            var inputs = attrs.inputs;

            console.log(inputs.inputs);
            
            var template =
            '<div ng-repeat="input in ' + inputs + '">' +
                '{{input.type}}' + 
            '</div>' +
            (inputs.inputs ? '<module-input inputs="' + inputs.inputs + '">' : '');

            element.html('').append( $compile( template )( scope ) );
        }
    };


}]);

