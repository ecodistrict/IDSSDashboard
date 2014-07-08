angular.module('idss-dashboard').directive('districtMap', [function () {

    var raster = new ol.layer.Tile({
        source: new ol.source.MapQuest({layer: 'sat'})
    });

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
          district: "="
        },
        link: function(scope, element, attrs) {

            var viewSettings = {
                center: scope.district.center || undefined,
                zoom: scope.district.zoom || 6
            };  

            var map = new ol.Map({
                interactions: ol.interaction.defaults({mouseWheelZoom: false}),
                layers: [raster],
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

            var extractDistrictPropertiesFromFeature = function(feature) {
                var geometry = feature.getGeometry();
                scope.district.area = geometry.getArea();
                scope.district.geometry = geometry.getCoordinates();
                scope.$apply();
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
                    extractDistrictPropertiesFromFeature(currentFeature);
                    // TODO: find a better way to look for change on feature
                    currentFeature.on('change', function(e) {
                        //console.log(e.target.getGeometry().getArea());
                        //console.log(e.target.getGeometry().getCoordinates());
                        extractDistrictPropertiesFromFeature(e.target);
                    });
                });
                drawInteraction.on('drawstart', function(e) {
                    console.log('drawstart');
                    if(currentFeature) {
                        featureOverlay.removeFeature(currentFeature);
                    }
                });
                
                map.addInteraction(drawInteraction);
            };

            // TODO: find better way to catch changes on map
            view.on('change:center', function(e) {
                scope.district.center = e.target.getCenter();
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
            // scope.$watch('type', function(oldType, newType) {
            //     if(oldType !== newType) {
            //         map.removeInteraction(drawInteraction);
            //         addInteraction();
            //     }
            // });

            addInteraction();

        }
    };
}]);