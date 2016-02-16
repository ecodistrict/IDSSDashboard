angular.module('idss-dashboard').directive('districtMap', ['$timeout', '$compile', 'CaseService', function ($timeout, $compile, CaseService) {

    return {
        restrict: 'E',
        template: ['<div id="map">',
        '</div>'].join(''),
        scope: {
            districtPolygon: '='
        },
        link: function(scope, element, attrs) {

            var map, districtLayer, drawBtn, editBtn, removeBtn, saveBtn;

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

            scope.buttonStates = buttonStates = {
                drawing: false,
                editing: false
            };

            function initMap() {

                map = L.map('map', {
                    zoomControl: false
                }).setView([50.736455, 6.328125], 4);

                $('.leaflet-control-container').css({display: 'none'});
                
                L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
                    type: 'map',
                    ext: 'jpg',
                    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                    subdomains: '1234'
                }).addTo(map);

                //Initialise the FeatureGroup to store editable layers
                var drawnItems = new L.FeatureGroup();
                map.addLayer(drawnItems);

                var options = {
                    draw: {
                        polyline: false,
                        rectangle: false,
                        circle: false,
                        marker: false,
                        polygon: {
                            allowIntersection: false,
                            guidelineDistance: 1,
                            drawError: {
                                color: '#e1e100', 
                                message: 'Polygon can not intersect!' 
                            },
                            shapeOptions: {
                                color: 'rgba(66, 139, 202, 1)',
                                weight: 1
                            }
                        }
                    },
                    edit: {
                        featureGroup: drawnItems
                    }
                };

                // Initialise the draw control and pass it the FeatureGroup of editable layers
                var drawControl = new L.Control.Draw(options);
                map.addControl(drawControl);

                districtLayer = L.geoJson().addTo(map);

                districtLayer.on('click', function(e) {
                    startEdit(e.layer);
                });

                map.on('click', function(e) {
                    stopEdit();
                });

                map.on('draw:created', function (e) {
                    var layer = e.layer;
                    districtLayer.addLayer(layer);
                    drawLayer.removeHooks();
                    buttonStates.drawing = false;
                    scope.districtPolygon = layer.toGeoJSON();
                    console.log(layer.toGeoJSON());
                    map.fitBounds(districtLayer.getBounds());
                    CaseService.saveCurrentCase().then(function(process) {
                        console.log(process);
                    });
                });

                // not triggered...
                map.on('draw:drawstart', function (e) {
                    console.log('draw:drawstart');
                    e.target.eachLayer(function(l) {
                        console.log(l);
                        districtLayer.removeLayer(l);
                    });
                });

                // not triggered...
                map.on('draw:edited', function (e) {
                    console.log('draw:edited');
                    var layers = e.layers;
                    stopEdit();
                });

                // add buttons

                drawBtn = angular.element('<button class="btn btn-sm btn-primary move-up-margin" ng-click="draw()" ng-show="!buttonStates.drawing && !districtPolygon.geometry">Draw</button>');

                scope.draw = function() {
                    console.log(buttonStates);
                    buttonStates.drawing = true;
                    drawLayer = new L.Draw.Polygon(map, options.draw.polygon);
                    drawLayer.addHooks();
                };

                editBtn = angular.element('<button class="btn btn-sm btn-primary move-up-margin" ng-click="edit()" ng-show="!buttonStates.drawing && districtPolygon.geometry">Edit</button>');

                scope.edit = function() {
                    if(!buttonStates.editing) {
                        startEdit();
                    } else {
                        stopEdit();
                    }
                };

                removeBtn = angular.element('<button class="btn btn-sm btn-primary move-up-margin" ng-click="remove()" ng-show="districtPolygon.geometry">Clear</button>');

                scope.remove = function() {
                    districtLayer.clearLayers();
                    buttonStates.drawing = false;
                    scope.districtPolygon = {};
                    CaseService.saveCurrentCase().then(function(process) {
                        console.log(process);
                    });
                };

                saveBtn = angular.element('<button class="btn btn-sm btn-primary move-up-margin" ng-click="save()" ng-show="districtPolygon.geometry">Save</button>');

                scope.save = function() {
                    // for now only on layer is possible
                    var layer;
                    districtLayer.eachLayer(function(l) {
                        l.editing.disable();
                        layer = l;
                    });
                    districtLayer.clearLayers();
                    scope.districtPolygon = layer.toGeoJSON(); // this will trigger watch - rerender
                    CaseService.saveCurrentCase({districtPolygon: scope.districtPolygon}).then(function(process) {
                        console.log(process);
                    });
                };

                element.append([drawBtn, editBtn, removeBtn, saveBtn]);
                $compile(drawBtn)(scope);
                $compile(editBtn)(scope);
                $compile(removeBtn)(scope);
                $compile(saveBtn)(scope);

                scope.$watch('districtPolygon', function(newPolygon, oldPolygon) {
                    console.log(newPolygon);
                    if(newPolygon && newPolygon.geometry) {
                        console.log(newPolygon);
                        // L.geoJson(data, {
                        //     style: function (feature) {
                        //         return {color: feature.properties.color};
                        //     },
                        //     onEachFeature: function (feature, layer) {
                        //         layer.bindPopup(feature.properties.description);
                        //     }
                        // }).addTo(map);
                        districtLayer.addData(newPolygon.geometry);
                        map.fitBounds(districtLayer.getBounds());
                    }
                });
            }

            function startEdit() {
                districtLayer.eachLayer(function(l) {
                    l.editing.enable();
                });

                buttonStates.editing = true;
            }

            function stopEdit() {
                if(buttonStates.editing) {
                    districtLayer.eachLayer(function(l) {
                        l.editing.disable();
                    });
                }

                buttonStates.editing = false;
            }

            initMap();

        }
    };
}]);