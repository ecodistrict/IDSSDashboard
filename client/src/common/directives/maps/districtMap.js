angular.module('idss-dashboard').directive('districtMap', [function () {

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
            district: "=",
            layer: "="
        },
        link: function(scope, element, attrs) {

            scope.district = scope.district || {};
            scope.district.properties = scope.district.properties || {};

            var viewSettings = {
                center: scope.district.properties.center || [1000000, 6600000],
                zoom: scope.district.properties.zoom || 6
            };  

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
                console.log(feature);
                // var geometry = feature.getGeometry();
                // scope.district.area = geometry.getArea();
                // scope.district.geometry = geometry.getCoordinates();
                // scope.$apply();
            };

            var addInteraction = function() {
                drawInteraction = new ol.interaction.Draw({
                    features: featureOverlay.getFeatures(),
                    type: 'Polygon'
                });
                drawInteraction.on('drawend', function(e) {
                    console.log('drawend');
                    currentFeature = e.feature;
                    console.log(e);
                    // TODO: find a better way to look for change on feature
                    currentFeature.on('change', function(e) {
                        //console.log(e.target.getGeometry().getArea());
                        //console.log(e.target.getGeometry().getCoordinates());
                        extractDistrictPropertiesFromFeature(e.target);
                    });
                    extractDistrictPropertiesFromFeature(currentFeature);

                });
                drawInteraction.on('drawstart', function(e) {
                    console.log('drawstart');
                    console.log(e);
                    if(currentFeature) {
                        featureOverlay.removeFeature(currentFeature);
                        currentFeature = undefined;
                    }
                });
                
                map.addInteraction(drawInteraction);
            };

            var addDistrictFeature = function(newDistrict) {
                // if(currentFeature) {
                //     featureOverlay.removeFeature(currentFeature);
                //     currentFeature = undefined;
                // }
                var feature = new ol.Feature(new ol.geom.Polygon(newDistrict.geometry.coordinates));
                featureOverlay.addFeature(feature);
            };

            // TODO: find better way to catch changes on map
            view.on('change:center', function(e) {
                scope.district.properties.center = e.target.getCenter();
            });
            // TODO: how to get zoom event?
            // zoomControl.on('change', function(e) {
            //     console.log(e);
            // });

            // get view properties
            //console.log(view.getProperties());

            // get zoom level
            //console.log(view.getZoom());

            // TODO: remove or use this wether need to change geometry type
            // scope.$watch('type', function(newType, oldType) {
            //     if(oldType !== newType) {
            //         map.removeInteraction(drawInteraction);
            //         addInteraction();
            //     }
            // });

            scope.$watch('layer', function(newLayer, oldLayer) {
                if(newLayer !== oldLayer) {
                    changeLayer(newLayer || 'Road');
                }
            });

            scope.$watch('district', function(newDistrict, oldDistrict) {
                if(newDistrict !== oldDistrict) {
                    addDistrictFeature(newDistrict);
                }
            });

            addInteraction();
            changeLayer('Road');

        }
    };
}]);