angular.module('idss-dashboard').directive('fileSourceResult', [ '$compile', function ($compile) {

    return {
        restrict: 'E',
        scope: {
            type: "=",
            input: "="
        },
        link: function(scope, element, attrs) {

            var input = scope.input;

            var render = function(type) {
                console.log(type);
                if(scope.type === 'geojson') {

                    var template = '<geojson-map data="input.value" options="input.options"></geojson-map>';
                    
                    element.html('').append( $compile( template )( scope ) );

                }
            };

            scope.$watch('type', function(newType, oldType) {
                if(oldType !== newType) {
                    render(newType);
                }
            });

        }
    };
}]);