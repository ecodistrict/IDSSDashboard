angular.module('idss-dashboard').directive('inputAggregation', ['$compile', function ($compile) {

    // take the first object in inputs array as parent in aggregation 
    // prepare a menu for the data object (geojson) in input object

	return {
        restrict: 'E',
        scope: {
            module: "="
        },
        link: function(scope, element, attrs) {

            var template = "<div>Test</div>";

        	console.log(scope);

        }
    };

}]);