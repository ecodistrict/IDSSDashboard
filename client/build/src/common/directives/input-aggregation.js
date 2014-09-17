angular.module('idss-dashboard').directive('inputAggregation', ['$compile', 'ProcessService', function ($compile, ProcessService) {

    // take the first object in inputs array as parent in aggregation 
    // prepare a menu for the data object (geojson) in input object

	return {
        restrict: 'EA',
        scope: {
            inputs: "="
        },
        link: function(scope, element, attrs) {

            console.log(scope);

            scope.currentProcess = ProcessService.getCurrentProcess();


            if(!scope.inputs || !scope.inputs.length || scope.inputs.length === 0) {
                return;
            }

            scope.data = scope.inputs[0].data || {};

            scope.layerOptions = [
                {name: "Road", label: "Road"},
                {name: "Aerial", label: "Aerial"},
                {name: "AerialWithLabels", label: "Aerial with labels"}
            ];

            scope.layer = scope.layerOptions[0].label;

            var template = "<div id=\"inputAggregationMenu\">Test</div>" + // aggregation-menu inputs selected map hierarchy in tree against data[level]
                "<div aggregation-map data=\"data\" layer=\"layer\"></div>" + 
                "<district-map class=\"selection-map\" district=\"currentProcess.district\" layer=\"layer\"></district-map>" +
                "<input type=\"file\" />";

            element.html('').append( $compile( template )( scope ) );

        }
    };

}]);