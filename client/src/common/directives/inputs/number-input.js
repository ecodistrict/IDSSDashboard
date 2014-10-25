angular.module('idss-dashboard').directive('idssDashboardNumberInput', ['$compile', 'ProcessService', function ($compile, ProcessService) {

	return {
        restrict: 'E',
        scope: {
            input: "="
        },
        link: function(scope, element, attrs) {

            console.log(scope.input);

            var template = "<input ng-model=\"input.value\" type=\"number\" />";

            element.html('').append( $compile( template )( scope ) );

        }
    };

}]);