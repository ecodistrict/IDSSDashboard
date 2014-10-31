angular.module('idss-dashboard').directive('geojsonMapInput', ['ProcessService', function (ProcessService) {

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
        restrict: 'E',
        scope: {
            input: '='
        },
        link: function(scope, element, attrs) {

            scope.layerOptions = [
                {name: "Road", label: "Road"},
                {name: "Aerial", label: "Aerial"},
                {name: "AerialWithLabels", label: "Aerial with labels"}
            ];

            var viewSettings = {
                center: district.center || [1000000, 6600000],
                zoom: district.zoom || 6
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
                var epsg = 'EPSG:3857';
                if(data.crs && data.crs.properties && data.crs.properties.name) {
                    epsg = data.crs.properties.name;
                }
                var vectorSource = new ol.source.GeoJSON({
                        object:data,
                        projection: epsg
                });
                if(vectorLayer) {
                    map.removeLayer(vectorLayer);
                }
                vectorLayer = new ol.layer.Vector({
                  source: vectorSource,
                  style: new ol.style.Style({
                    stroke: new ol.style.Stroke({
                      //lineDash: [0],
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
                var extent = vectorLayer.getSource().getExtent();

                view.fitExtent(extent, map.getSize());
            };

            scope.$watch('input.value', function(newData, oldData) {
                if(oldData !== newData) {
                    console.log(newData);
                    initGeometryData(newData);
                }
            });

            if(scope.input.value) {
                initGeometryData(scope.input.value);
            }

            changeLayer('Road');

        }
    };
}]);