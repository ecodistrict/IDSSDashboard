angular.module('idss-dashboard').directive('kpiMap', ['socket', '$compile', 'ModuleService', '$timeout', '$modal', 
    function (socket, $compile, ModuleService, $timeout, $modal) {

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
        '<div id="map" style="margin-top:-20px">',
        '</div>'].join(''),
        scope: {
            kpiList: '=',
            variantList: '=',
            selectedVariant: '=',
            case: '=',
            user: '='
        },
        link: function(scope, element, attrs) {

            socket.forward('getKpiResult', scope);
            socket.forward('getGeoJson', scope);

            var map, geojson, kpiLayer, kpiResultData, geoJsonData;

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
            scope.selectedKpi = null;

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

                map = L.map('map', {zoomControl: false}).setView([49.87, 10.81], 4);
                
                L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
                    type: 'map',
                    ext: 'jpg',
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: '1234'
                }).addTo(map);
            }

            function getColor(bad, excellent, sufficient, value) {
                var color = d3.scale.linear()
                .domain([bad, sufficient, excellent])
                .range(["red", "yellow", "green"]);

                return color(value);
            }

            function getBad(sufficient, excellent) {
              if((!excellent && excellent !== 0) || (!sufficient && sufficient !== 0)) {
                return 0;
              } 
              // span is a 6 out of 10
              var span = Math.abs(sufficient - excellent) * 1.5;
              if(sufficient >= excellent) {
                return sufficient + span;
              } else {
                return sufficient - span;
              }
            }

            function loadLayer(kpi, variant) {
                if(!kpi || !variant) {
                    console.log('no kpi or variant');
                    console.log(kpi, variant);
                    return;
                }
                // set new active kpi and variant
                scope.selectedKpi = kpi;
                scope.selectedVariant = variant;
                // delete current dataset from scope
                kpiResultData = null;
                geoJsonData = null;
                // send both events, react when both are back
                socket.emit('getKpiResult', {
                  caseId: scope.case._id,
                  variantId: variant._id,
                  kpiId: kpi._id,
                  moduleId: "Stockholm_Green_Area_Factor",
                  userId: scope.user._id
                });
                socket.emit('getGeoJson', {
                  caseId: scope.case._id,
                  variantId: variant._id,
                  userId: scope.user._id
                });
            }

            function initLayers() {
                var initialKpi, initialVariant = scope.selectedVariant;
                if(!scope.kpiList || scope.kpiList.length === 0) {
                    return;
                }
                initialKpi = scope.kpiList[0];
                if(!scope.selectedVariant && scope.variantList && scope.variantList.length > 0) {
                    initialVariant = scope.variantList[0];
                }
                loadLayer(initialKpi, initialVariant);
            }

            function prepareGeoJsonData(geoJsonData, kpiResultData) {
                console.log(geoJsonData);
                console.log(kpiResultData);
                console.log('add kpi values to feature properties');
            }

            // the kpiResultData and geoJsonData need to have been loaded
            function drawLayer() {

                if(!kpiResultData || !geoJsonData) {
                    return;
                }

                prepareGeoJsonData(geoJsonData, kpiResultData);

                var kpi = scope.selectedKpi;
                kpi.bad = getBad(kpi.sufficient, kpi.excellent);

                function pointToLayer(feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }

                function onEachFeature(feature, layer) {

                    var color = "#666666";

                    if((kpi.excellent || kpi.excellent === 0) && (kpi.sufficient || kpi.sufficient === 0) && (kpi.bad || kpi.bad === 0) && (feature.properties.kpiValue || feature.properties.kpiValue === 0)) {
                        color = getColor(kpi.bad, kpi.excellent, kpi.sufficient, feature.properties.kpiValue);
                    }

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

                kpiLayer = L.geoJson(geoJsonData, {
                    pointToLayer: pointToLayer,
                    onEachFeature: onEachFeature
                }).addTo(map);

                map.fitBounds(kpiLayer.getBounds());
            }

            initMap();
            initLayers();

            scope.loadLayer = loadLayer;

            scope.$on('socket:getKpiResult', function (ev, data) {

                kpiResultData = data;

                if(geoJsonData) {
                    drawLayer();
                }

            });

            scope.$on('socket:getGeoJson', function (ev, data) {

                geoJsonData = data;

                if(kpiResultData) {
                    drawLayer();
                }

            });



            // scope.setModuleInput = function() {

            //     if(!scope.selectedKpi || !scope.selectedVariant) {
            //         return;
            //     }

            //     var moduleInputModal = $modal.open({
            //         templateUrl: 'kpi-map/file-connection.tpl.html',
            //         controller: 'FileConnectionController',
            //         resolve: {
            //           kpi: function() {
            //             return scope.selectedKpi;
            //           },
            //           variant: function() {
            //             return scope.selectedVariant;
            //           }
            //         }
            //       });

            //       moduleInputModal.result.then(function (moduleInput) {
            //         if(moduleInput) {
            //           kpi.inputs = moduleInput.inputs;
            //           moduleInput.userId = $scope.currentUser._id; // only facilitator should be able to do this
            //           moduleInput.status = 'unprocessed'; // input has changed
            //           console.log(moduleInput);
            //           kpi.status = 'unprocessed'; // update GUI
            //           ModuleService.saveModuleInput(moduleInput);
            //         }
                            
            //       }, function () {
            //         console.log('Modal dismissed at: ' + new Date());
            //       });

            // };

        }
    };
}]);