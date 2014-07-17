angular.module('idss-dashboard').directive('moduleIndata', ['$compile', function ($compile) {

	return {
        restrict: 'E',
        scope: {
            input: "="
        },
        link: function(scope, element, attrs) {

            console.log(scope.input);

        	var templates = {
        		"aggregation": "<input-aggregation input=\"inputs\" />"
        	};

        	element.html('').append( $compile( templates[scope.input.type] )( scope ) );

        }
    };

}]);