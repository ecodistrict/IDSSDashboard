angular.module('idss-dashboard').directive('districtMap', ['$compile', 'ProcessService', '$timeout', function ($compile, ProcessService, $timeout) {

    var defaultProjection = 'EPSG:3857';

    var featureStyleNormal = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(66, 139, 202, 1)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(66, 139, 202, 0.1)'
        })
    });

    var currentFeature;

    var vectorSource = new ol.source.GeoJSON({
        projection: defaultProjection
    });
    var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
        style: featureStyleNormal
    });

    var layers = [
      new ol.layer.Tile({
        style: 'Road',
        visible: false,
        source: new ol.source.MapQuest({layer: 'osm'})
      }),
      new ol.layer.Tile({
        style: 'Aerial',
        visible: false,
        source: new ol.source.MapQuest({layer: 'sat'})
      }),
      new ol.layer.Group({
        style: 'AerialWithLabels',
        visible: false,
        layers: [
          new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'sat'})
          }),
          new ol.layer.Tile({
            source: new ol.source.MapQuest({layer: 'hyb'})
          })
        ]
      }),
      vectorLayer
    ];  

    var drawInteraction;
    var modifyInteraction;

    var zoomControl = new ol.control.Zoom();

    var featureOverlay = new ol.FeatureOverlay({
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new ol.style.Circle({
          radius: 7,
          fill: new ol.style.Fill({
            color: '#ffcc33'
          })
        })
      })
    });

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            district: "="
        },
        link: function(scope, element, attrs) {

            // wrap the execution in a function to wait for dom to be ready
            // TODO: this is not a nice solution, maybe use http://buzzdecafe.github.io/2014/03/20/directive-after-dom/
            function initMap() {

                $timeout(function() {
                    // default viewport (central europe)
                    var viewSettings = {
                        center: [1000000, 6600000],
                        zoom: 4
                    };  

                    var map = new ol.Map({
                        interactions: ol.interaction.defaults({mouseWheelZoom: false}),
                        layers: layers,
                        controls: [zoomControl],
                        target: element[0],
                        ol3Logo: false,
                        view: new ol.View(viewSettings)
                    });
                    var view = map.getView();
                    featureOverlay.setMap(map);


                    var zoomslider = new ol.control.ZoomSlider();
                    map.addControl(zoomslider);

                    scope.changeLayer = function(layer) {
                        for (var i = 0; i < layers.length; i++) {
                            if(layers[i].get('style')) { // TODO: style of vector layer is undefined, this is a hack to hide the inactual backgrounds
                                layers[i].set('visible', (layers[i].get('style') === layer));
                            } else {
                                layers[i].set('visible', true); // this is vector layer
                            }
                        }
                    };

                    scope.addInteraction = function(type) {
                        scope.interaction = type;
                        if(type === 'draw') {

                            // add existing features from vector layer to be edited
                            var existingFeatures = vectorSource.getFeatures();
                            _.each(existingFeatures, function(f) {
                                featureOverlay.addFeature(f);
                            });

                            modifyInteraction = new ol.interaction.Modify({
                                features: featureOverlay.getFeatures(),
                                deleteCondition: function(event) {
                                    return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
                                }
                            });
                            map.addInteraction(modifyInteraction);

                            drawInteraction = new ol.interaction.Draw({
                                features: featureOverlay.getFeatures(),
                                type: 'Polygon'
                            });
                            map.addInteraction(drawInteraction);

                        } else if(type === 'navigate') {
                            //map.addInteraction(new ol.interaction.DragRotateAndZoom());
                            map.removeInteraction(modifyInteraction);
                            map.removeInteraction(drawInteraction);
                            featureOverlay.getFeatures().clear();
                        }
                        
                    };

                    // init map with existing district polygons
                    var addDistrictFeatures = function(geometry) {
                        if(!geometry) {
                            return;
                        }
                        console.log(geometry);
                        var geoJsonFormat = new ol.format.GeoJSON();
                        var features = geoJsonFormat.readFeatures(geometry);
                        console.log(features);
                        vectorSource.addFeatures(features);
                        var extent = vectorLayer.getSource().getExtent();
                        view.fitExtent(extent, map.getSize());
                        
                    };

                    scope.saveDistrictPolygons = function() {
                        var geoJsonFormat = new ol.format.GeoJSON();
                        var features = featureOverlay.getFeatures().getArray();
                        console.log(features);
                        var districtGeometry = geoJsonFormat.writeFeatures(features, {
                            featureProjection: 'EPSG:3857',
                            dataProjection: 'EPSG:3857'
                        });
                        console.log(districtGeometry);
                        scope.district.geometry = districtGeometry;
                        ProcessService.saveCurrentProcess().then(function(process) {
                            console.log(process);
                        });
                        vectorSource.addFeatures(features);
                        var extent = vectorLayer.getSource().getExtent();
                        view.fitExtent(extent, map.getSize());
                        scope.addInteraction('navigate');
                        
                    };

                    scope.clearDistrictPolygons = function() {
                        featureOverlay.getFeatures().clear();
                        vectorSource.clear();
                    };

                    scope.$watch('layer', function(newLayer, oldLayer) {
                        if(newLayer !== oldLayer) {
                            console.log(newLayer, oldLayer);
                            scope.changeLayer(newLayer || 'Road');
                        }
                    });

                    scope.$watch('district', function(newDistrict, oldDistrict) {
                        if(newDistrict && newDistrict.geometry !== oldDistrict.geometry) {
                            console.log(newDistrict, oldDistrict);
                            addDistrictFeatures(newDistrict.geometry);
                        }
                    });

                    scope.layerOptions = [
                        {name: "Road", label: "Road"},
                        {name: "Aerial", label: "Aerial"},
                        {name: "AerialWithLabels", label: "Aerial with labels"}
                    ];

                    scope.layer = scope.layerOptions[0].label;
                    scope.changeLayer(scope.layer);

                    var buttonPanel = angular.element([
                        '<div id="button-panel" class="btn-group">',
                            //'<button type="button" ng-class="interaction == \'navigate\' ? \'btn-primary\' : \'btn-default\'" ng-click="addInteraction(\'navigate\')" class="btn">Navigate</button>',
                            '<button type="button" ng-show="interaction==\'draw\'" ng-click="saveDistrictPolygons()" class="btn btn-default">Save district</button>',
                            '<button type="button" ng-show="interaction==\'draw\'" ng-click="clearDistrictPolygons()" class="btn btn-default">Clear</button>',
                            '<button type="button" ng-show="interaction!=\'draw\'" ng-click="addInteraction(\'draw\')" class="btn btn-default">{{district.geometry ? \'Edit\' : \'Draw\'}} district boundary</button>',
                        '</div>',
                        '<div id="layer-panel" class="btn-group dropup">',
                            '<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-expanded="false">',
                                '{{layer}} <span class="caret"></span>',
                            '</button>',
                            '<ul class="dropdown-menu" role="menu">',
                                '<li ng-repeat="l in layerOptions">',
                                    '<a ng-click="changeLayer(l.name)">{{l.label}}</a>',
                                '</li>',
                            '</ul>',
                        '</div>',
                        '<div id="info-panel">',
                            '<p ng-show="district.area">Area: {{(district.area / 10) | number : 0}} m<sup>2</sup></p>',
                        '</div>'].join(''));
                
                    $compile(buttonPanel)(scope);
                    $(map.getTarget()).find('.ol-viewport').append(buttonPanel);
                    //element

                    addDistrictFeatures(scope.district.geometry);

                    
                }, 200);
            }

            initMap();

        }
    };
}]);