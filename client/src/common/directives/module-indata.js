angular.module('idss-dashboard').directive('moduleIndata', ['$compile', function ($compile) {

	return {
        restrict: 'EA',
        scope: {
            input: "="
        },
        link: function(scope, element, attrs) {

            console.log(scope.input);

            scope.layerOptions = [
                {name: "Road", label: "Road"},
                {name: "Aerial", label: "Aerial"},
                {name: "AerialWithLabels", label: "Aerial with labels"}
              ];

            scope.layer = scope.layerOptions[0].label;

            var x = angular.element('<div aggregation-map data=\"data\" layer=\"layer\"></div>');
            element.append(x);
            $compile(x)(scope);

        }
    };

}]);