angular.module('idss-dashboard').directive('kpiMap', ['ProcessService', '$compile', 'ModuleService', '$timeout', function (ProcessService, $compile, ModuleService, $timeout) {

    return {
        restrict: 'E',
        template: ['<div id="properties-panel" ng-show="selectedFeature" class="panel panel-default">',
                            '<div class="list-group">',
                            "  <a class='list-group-item'><b>KPI value: </b> {{selectedFeature.properties.kpiValue || 'Not set'}}</a>",
                            "  <a class='list-group-item list-group-item-success'><b>Excellent: </b> {{selectedKpi.excellent || 'Not set'}}</a>",
                            "  <a class='list-group-item list-group-item-warning'><b>Sufficient: </b> {{selectedKpi.sufficient || 'Not set'}}</a>",
                            '</div>',
                    '</div>',
        '<div id="variant-dropdown" class="dropdown">',
        '     <button class="btn btn-default dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="true">',
        '       {{selectedVariant.name}}',
        '       <span class="caret"></span>',
        '     </button>',
        '     <ul id="map-variant-dropdown" class="dropdown-menu" aria-labelledby="kpi-dropdown">',
        '       <li ng-repeat="variant in variantList"><a ng-click="loadLayer(selectedKpi, variant)">{{variant.name}}</a></li>',
        '     </ul>',
        '   </div>',
        '<div id="kpi-dropdown" class="dropdown">',
        '     <button class="btn btn-default dropdown-toggle" type="button" aria-haspopup="true" aria-expanded="true">',
        '       {{selectedKpi.name}} in {{selectedKpi.unit}}',
        '       <span class="caret"></span>',
        '     </button>',
        '     <ul id="map-kpi-dropdown" class="dropdown-menu" aria-labelledby="kpi-dropdown">',
        '       <li ng-repeat="kpi in kpiList"><a ng-click="loadLayer(kpi, selectedVariant)">{{kpi.name}} in {{kpi.unit}}</a></li>',
        '     </ul>',
        '   </div>',
        '<div id="map">',
        '</div>'].join(''),
        scope: {
            kpiList: '=',
            variantList: '=',
            selectedVariant: '=',
            trig: '='
        },
        link: function(scope, element, attrs) {

            var map, geojson;

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
                            initLayers();
                        }, 200);
                    }
                }
            });

            function initMap() {

                map = L.map('map', {zoomControl: false}).setView([51.505, -0.09], 13);
                
                L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
                    type: 'map',
                    ext: 'jpg',
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: '1234'
                }).addTo(map);
            }

            function loadLayer(kpi, variant) {
                // TODO: unbind previous events?
                console.log(kpi);
                scope.selectedKpi = kpi;
                scope.selectedVariant = variant;

                ModuleService.getModuleOutput(variant._id, kpi.selectedModuleId, kpi.kpiAlias).then(function(data) {

                    function pointToLayer(feature, latlng) {
                        return L.circleMarker(latlng, geojsonMarkerOptions);
                    }

                    function onEachFeature(feature, layer) {

                        layer.setStyle(defaultStyle);

                        layer.on("mouseover", function (e) {
                            layer.setStyle(highlightStyle);
                            scope.selectedFeature = feature;
                            console.log(feature);
                            scope.$digest();
                        });

                        layer.on("mouseout", function (e) {
                            layer.setStyle(defaultStyle); 
                            scope.selectedFeature = null;
                            scope.$digest();

                        });

                    }

                    console.log(data);
                    if(data && data.outputs) {
                        geojson = _.find(data.outputs, function(d) {return d.type === 'geojson';});
                        if(geojson && geojson.value) {
                            console.log(map);

                            var geojsonMarkerOptions = {
                                radius: 8,
                                fillColor: "#ff7800",
                                color: "#000",
                                weight: 1,
                                opacity: 1,
                                fillOpacity: 0.8
                            };
                            

                            var featureLayer = L.geoJson(geojson.value, {
                                pointToLayer: pointToLayer,
                                onEachFeature: onEachFeature
                            }).addTo(map);

                            map.fitBounds(featureLayer.getBounds());
                        }
                    }
                });
            }

            function initLayers() {
                if(!scope.kpiList || scope.kpiList.length === 0) {
                    return;
                }
                scope.selectedKpi = scope.kpiList[0];
                if(!scope.selectedVariant && scope.variantList && scope.variantList > 0) {
                    scope.selectedVariant = scope.variantList[0];
                }
                loadLayer(scope.selectedKpi, scope.selectedVariant);

            }

            scope.loadLayer = loadLayer;
            

        }
    };
}]);