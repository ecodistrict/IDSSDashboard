angular.module('idss-dashboard').directive('collectDataMap', ['ProcessService', '$compile', 'ModuleService', '$timeout', function (ProcessService, $compile, ModuleService, $timeout) {

    return {
        restrict: 'E',
        template: ['<div id="properties-panel" ng-show="selectedFeature" class="panel panel-default">',
                            '<div class="list-group">',
                            '  <a class="list-group-item" ng-repeat="(key, value) in selectedFeature.properties">{{key}}: {{value}}</a>',
                            '</div>',
                    '</div>', 
                    '<div id="map">',
        '</div>'].join(''),
        scope: {
            trig: '='
        },
        link: function(scope, element, attrs) {

            var map, geojson, kpiLayer;

            var defaultStyle = {
                color: "#2262CC",
                weight: 2,
                opacity: 0.6,
                fillOpacity: 0.1,
                fillColor: "#2262CC"
            };

            var highlightStyle = {
                color: '#2262CC', 
                weight: 3,
                opacity: 0.6,
                fillOpacity: 0.65,
                fillColor: '#2262CC'
            };

            scope.selectedFeature = null;

            scope.$watch('trig', function(newValue, oldValue) {
                if(newValue && newValue !== oldValue) {
                    if(!map) {
                        $timeout(function() {
                            initMap();
                        }, 200);
                    }
                }
            });

            function initMap() {

                map = L.map('map', {zoomControl: false}).setView([49.87, 10.81], 4);
                
                L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
                    type: 'map',
                    ext: 'jpg',
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: '1234'
                }).addTo(map);

                ProcessService.getProcessGeojson().then(function(geojson) {
                    console.log(geojson);
                    addGeojsonData(geojson.row_to_json);
                });
            }

            function addGeojsonData(geojsonData) {

                function pointToLayer(feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }

                function onEachFeature(feature, layer) {

                    var color = "#666666";

                    // if((kpi.excellent || kpi.excellent === 0) && (kpi.sufficient || kpi.sufficient === 0) && (kpi.bad || kpi.bad === 0) && (feature.properties.kpiValue || feature.properties.kpiValue === 0)) {
                    //     color = getColor(kpi.bad, kpi.excellent, kpi.sufficient, feature.properties.kpiValue);
                    // }

                    layer.setStyle({
                        color: color,
                        weight: 3,
                        opacity: 0.6,
                        fillOpacity: 0.1,
                        fillColor: color
                    });


                    layer.on("mouseover", function (e) {
                        layer.setStyle(highlightStyle);
                        scope.selectedFeature = feature;
                        console.log(feature);
                        scope.$digest();
                    });

                    layer.on("mouseout", function (e) {
                        layer.setStyle({
                            color: color,
                            weight: 3,
                            opacity: 0.6,
                            fillOpacity: 0.1,
                            fillColor: color
                        }); 
                        scope.selectedFeature = null;
                        scope.$digest();

                    });

                }

                var geojsonMarkerOptions = {
                    radius: 8,
                    fillColor: "#ff7800",
                    color: "#000",
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 0.8
                };

                if(kpiLayer) {
                    map.removeLayer(kpiLayer);
                }

                kpiLayer = L.geoJson(geojsonData, {
                    pointToLayer: pointToLayer,
                    onEachFeature: onEachFeature
                }).addTo(map);

                map.fitBounds(kpiLayer.getBounds());
            }
            
        }
    };
}]);