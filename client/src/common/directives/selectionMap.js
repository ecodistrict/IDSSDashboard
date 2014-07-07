angular.module('idss-dashboard').directive('selectionMap', [function () {

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
          type: "=",
          geometry: "="
        },
        link: function(scope, element, attrs) {

            var map = new ol.Map({
                layers: [raster],
                target: element[0],
                view: new ol.View2D({
                    center: [1000000, 6600000],
                    zoom: 4
                })
            });

            console.log(scope);

            featureOverlay.setMap(map);
            
            map.addInteraction(modify);

            var drawInteraction; 

            var addInteraction = function() {
                drawInteraction = new ol.interaction.Draw({
                    features: featureOverlay.getFeatures(),
                    type: scope.type
                });
                map.addInteraction(drawInteraction);
            };

            scope.$watch('type', function(oldType, newType) {
                if(oldType !== newType) {
                    map.removeInteraction(drawInteraction);
                    addInteraction();
                }
            });

            addInteraction();

        }
    };
}]);