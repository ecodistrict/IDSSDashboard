angular.module('idss-dashboard').directive('districtMap', ['$timeout', '$compile', function ($timeout, $compile) {

    return {
        restrict: 'E',
        template: ['<div id="map">',
        '</div>'].join(''),
        scope: {
            district: '='
        },
        link: function(scope, element, attrs) {

            var map, districtLayer, buildingLayer, drawBtn, editBtn, removeBtn, saveBtn;

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

                buildingLayer = L.geoJson().addTo(map);

                buildingLayer.on('click', function(e) {
                    startEdit(e.layer);
                });

                map.on('click', function(e) {
                    stopEdit();
                });

                map.on('draw:created', function (e) {
                    var layer = e.layer;
                    buildingLayer.addLayer(layer);
                    drawLayer.removeHooks();
                    //drawBtn.removeClass('btn-default').addClass('btn-primary');
                    updateZoomLevel(existingBuildingData);
                    updateButtons(existingBuildingData);
                });

                map.on('draw:drawstart', function (e) {
                    console.log('draw:drawstart');
                    e.target.eachLayer(function(l) {
                        console.log(l);
                        buildingLayer.removeLayer(l);
                    });
                });

                map.on('draw:edited', function (e) {
                    var layers = e.layers;
                    console.log('draw:edited');
                    stopEdit();
                });

                // add buttons

                drawBtn = angular.element('<button class="btn btn-primary" ng-click="draw()" ng-show="!buttonStates.drawing">Draw</button>');

                scope.draw = function() {
                    console.log(buttonStates);
                    buttonStates.drawing = true;
                    drawLayer = new L.Draw.Polygon(map, options.draw.polygon);
                    drawLayer.addHooks();
                };

                editBtn = angular.element('<button>Edit</button>');

                editBtn.click(function() {
                    if(!buttonStates.editing) {
                        startEdit();
                    } else {
                        stopEdit();
                    }
                });

                removeBtn = angular.element('<button>Remove</button>');

                removeBtn.click(function() {
                    buildingLayer.clearLayers();
                    updateButtons();
                });

                saveBtn = angular.element('<button>Save</button>');

                saveBtn.click(function() {
                    console.log('save district polygon');
                });

                element.append([drawBtn, editBtn, removeBtn, saveBtn]);
                $compile(drawBtn)(scope);

                scope.$watch('district', function(newDistrict, oldDistrict) {
                    if(newDistrict && newDistrict.geometry !== oldDistrict.geometry) {
                        console.log(newDistrict);
                        // L.geoJson(data, {
                        //     style: function (feature) {
                        //         return {color: feature.properties.color};
                        //     },
                        //     onEachFeature: function (feature, layer) {
                        //         layer.bindPopup(feature.properties.description);
                        //     }
                        // }).addTo(map);
                        buildingLayer.addData(newDistrict.geometry);
                        map.fitBounds(buildingLayer.getBounds());
                    }
                });
            }

            function startEdit() {
                buildingLayer.eachLayer(function(l) {
                    l.editing.enable();
                });

                buttonStates.editing = true;
            }

            function stopEdit() {
                if(buttonStates.editing) {
                    buildingLayer.eachLayer(function(l) {
                        l.editing.disable();
                    });
                }

                buttonStates.editing = false;
            }

            function updateButtons(buildingData) {
                // if(buildingData.geoJson.geometry.coordinates.length > 0) {
                //     drawBtn.hide();
                //     editBtn.show();
                //     removeBtn.show();
                // } else {
                //     drawBtn.show();
                //     editBtn.hide();
                //     removeBtn.hide();
                // }
            }

            initMap();

        }
    };
}]);