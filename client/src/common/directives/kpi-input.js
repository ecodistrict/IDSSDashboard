angular.module('idss-dashboard').directive('kpiInput', ['$compile', function($compile) {

    return {
        restrict: 'E',
        link: function ( scope, element, attrs ) {

            var inputs = attrs.inputs;

            console.log(inputs.inputs);
            
            var template =
            '<div ng-repeat="input in ' + inputs + '">' +
                '<kpi-input-{{input.type}} input="input">' + 
            '</div>' +
            (inputs.inputs ? '<kpi-input inputs="' + inputs.inputs + '">' : '');

            element.html('').append( $compile( template )( scope ) );
        }
    };


}]);

