angular.module('idss-dashboard').directive('moduleIndata', [function () {

	return {
        restrict: 'E',
        scope: {
            module: "="
        },
        link: function(scope, element, attrs) {

        	console.log(scope);

        }
    };

}]);