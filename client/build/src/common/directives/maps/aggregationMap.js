angular.module('idss-dashboard').directive('aggregationMap', [ 'ProcessService', '$timeout', function (ProcessService, $timeout) {

    // get the current project to use district geometry
    var district = ProcessService.getCurrentProcess().district;

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
      })
    ];

    var layerSelectTemplate = '<select ng-model="layer" ng-options="l.name as l.label for l in layerOptions"></select>';

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

    var zoomControl = new ol.control.Zoom();

    var modify = new ol.interaction.Modify({
        features: featureOverlay.getFeatures(),
        // the SHIFT key must be pressed to delete vertices, so
        // that new vertices can be drawn at the same position
        // of existing vertices
        deleteCondition: function(event) {
            return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event);
        }
    });

    return {
        restrict: 'EA',
        scope: {
            inputs: "=",
            data: "="
        },
        link: function(scope, element, attrs) {

            if(!scope.inputs || !scope.inputs.length || scope.inputs.length === 0) {
                return;
            }

            var parentInput = scope.inputs[0]; // the aggregation always display first level at map start

            scope.layerOptions = [
                {name: "Road", label: "Road"},
                {name: "Aerial", label: "Aerial"},
                {name: "AerialWithLabels", label: "Aerial with labels"}
            ];

            scope.layer = scope.layerOptions[0].label;

            var viewSettings = {
                center: district.center || [1000000, 6600000],
                zoom: district.zoom || 6
            };  

            console.log(scope);
            console.log(district);

            var map = new ol.Map({
                interactions: ol.interaction.defaults({mouseWheelZoom: false}),
                layers: layers,
                controls: [zoomControl],
                target: element[0],
                ol3Logo: false,
                view: new ol.View2D(viewSettings)
            });

            var view = map.getView();
            var currentFeature;
            var drawInteraction; 
            var vectorLayer;

            featureOverlay.setMap(map);
            //featureOverlay.addFeature();
            map.addInteraction(modify);
            var zoomslider = new ol.control.ZoomSlider();

            map.addControl(zoomslider);

            var changeLayer = function(layer) {
                for (var i = 0; i < layers.length; i++) {
                    layers[i].set('visible', (layers[i].get('style') === layer));
                }
            };

            var extractDistrictPropertiesFromFeature = function(feature) {
                var geometry = feature.getGeometry();
                district.area = geometry.getArea();
                district.geometry = geometry.getCoordinates();
                scope.$apply();
            };

            var initGeometryData = function(data) {
                if(!data) {
                    return;
                }
                var vectorSource = new ol.source.GeoJSON(
                    /** @type {olx.source.GeoJSONOptions} */ ({
                        object:data
                }));
                if(vectorLayer) {
                    map.removeLayer(vectorLayer);
                }
                vectorLayer = new ol.layer.Vector({
                  source: vectorSource,
                  style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                      lineDash: [4],
                      color: 'rgba(0, 0, 255, 0.7)',
                      width: 1
                    }),
                    fill: new ol.style.Fill({
                      color: 'rgba(0, 0, 255, 0.1)'
                    })
                  })
                });
                map.addLayer(vectorLayer);
                console.log(map);
            };

            // var addInteraction = function() {
            //     drawInteraction = new ol.interaction.Draw({
            //         features: featureOverlay.getFeatures(),
            //         type: 'Polygon'
            //     });
            //     drawInteraction.on('drawend', function(e) {
            //         console.log('drawend');
            //         currentFeature = e.feature;
            //         console.log(e);
            //         // TODO: find a better way to look for change on feature
            //         currentFeature.on('change', function(e) {
            //             //console.log(e.target.getGeometry().getArea());
            //             //console.log(e.target.getGeometry().getCoordinates());
            //             extractDistrictPropertiesFromFeature(e.target);
            //         });
            //         extractDistrictPropertiesFromFeature(currentFeature);

            //     });
            //     drawInteraction.on('drawstart', function(e) {
            //         console.log('drawstart');
            //         console.log(e);
            //         if(currentFeature) {
            //             featureOverlay.removeFeature(currentFeature);
            //             currentFeature = undefined;
            //         }
            //     });
                
            //     map.addInteraction(drawInteraction);
            // };

            // scope.$watch('layer', function(newLayer, oldLayer) {
            //     if(oldLayer !== newLayer) {
            //         changeLayer(newLayer || 'Road');
            //     }
            // });

            //addInteraction();

            scope.$watch('data', function(newData, oldData) {
                if(oldData !== newData) {
                    initGeometryData(newData);
                }
            });

            initGeometryData(parentInput.data);

            changeLayer('Road');

        }
    };
}]);