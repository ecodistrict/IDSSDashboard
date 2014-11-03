angular.module('idss-dashboard').directive('geojsonMapInput', ['ProcessService', '$compile', function (ProcessService, $compile) {

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

    var featureStyleNormal = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(66, 139, 202, 1)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(66, 139, 202, 0.1)'
        })
    });

    var featureStyleHover = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(66, 139, 202, 1)',
            width: 1
        }),
        fill: new ol.style.Fill({
            color: 'rgba(66, 139, 202, 0.5)'
        })
    });

    var featureStyleSelected = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(66, 139, 202, 1)',
            width: 2
        }),
        fill: new ol.style.Fill({
            color: 'rgba(66, 139, 202, 0.8)'
        })
    });

    var selectedTextStyleFunction = function(label) { 
        if(!label) {
            console.log('no label');
            return null;
        }
        return new ol.style.Style({
            text: new ol.style.Text({
                font: '14px helvetica,sans-serif', 
                text: label,
                fill: new ol.style.Fill({
                    color: '#000'
                }),
                stroke: new ol.style.Stroke({ color: '#fff',
                width: 2 })
            }) 
        });
    };

    // style output features depending on some property

    // var getFeatureStyle = function(feature, property) {
    //     var color = greenYellowRed(property);
        
    //     return new ol.style.Style({
    //         stroke: new ol.style.Stroke({
    //             color: 'rgba(' + color + ', 1)',
    //             width: 1
    //         }),
    //         fill: new ol.style.Fill({
    //             color: 'rgba(' + color + ', 0.5)'
    //         })
    //     });
    // };

    // use for colorizing output

    // var greenYellowRed = function($number) {
    //   //$number--; // working with 0-99 will be easier
    //   $number = $number * 100;
    //   if ($number < 50) {
    //     // green to yellow
    //     $r = Math.floor(255 * ($number / 50));
    //     $g = 255;

    //   } else {
    //     // yellow to red
    //     $r = 255;
    //     $g = Math.floor(255 * ((50-$number%50) / 50));
    //   }
    //   $b = 0;

    //   return $r + ',' + $g + ',' + $b;
    // };

    return {
        restrict: 'E',
        scope: {
            input: '='
        },
        link: function(scope, element, attrs) {

            scope.selectedFeatures = [];
            //var highlightedFeatures = [];

            // var unselectHighlightedFeatures = function() {
            //     _.each(highlightedFeatures, function(feature) {
            //         // only reset style if this is not a selected feature
            //         if(!feature.selected) {
            //             feature.setStyle(featureStyleNormal);
            //         }
            //     });
            //     highlightedFeatures = [];
            // };      

            var toggleSelectedFeature = function(feature) {
                var found = _.find(scope.selectedFeatures, function(f){return f === feature;});
                if(found) {
                    found.setStyle(null);
                    var index = scope.selectedFeatures.indexOf(found);
                    scope.selectedFeatures.splice(index, 1);  
                } else {

                    // style for showing certain property (use for output)
                    
                    // var properties = feature.getProperties();
                    // if(properties.SHADOW_FRACTION) {
                    //     feature.setStyle([getFeatureStyle(feature, properties.SHADOW_FRACTION), selectedTextStyleFunction(properties.SHADOW_FRACTION)]);
                    // } else {
                    //     feature.setStyle(featureStyleSelected);
                    // }
                    feature.setStyle(featureStyleSelected);
                    scope.selectedFeatures.push(feature);
                }
            };


            scope.unselectAllFeatures = function() {
                while(scope.selectedFeatures.length > 0) {
                    scope.selectedFeatures[scope.selectedFeatures.length-1].setStyle(null);
                    scope.selectedFeatures.pop();
                }
            };

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
                view: new ol.View(viewSettings)
            });

            var view = map.getView();
            var currentFeature;
            var drawInteraction; 
            var vectorLayer;

            featureOverlay.setMap(map);
            //featureOverlay.addFeature();
            //map.addInteraction(modify);
            var zoomslider = new ol.control.ZoomSlider();

            map.addControl(zoomslider);

            var changeLayer = function(layer) {
                for (var i = 0; i < layers.length; i++) {
                    layers[i].set('visible', (layers[i].get('style') === layer));
                }
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
                  style: featureStyleNormal
                });

                // style geometries individually in output:

                // var features = vectorSource.getFeatures();

                // _.each(features, function(f) {
                //     var p = f.getProperties();
                //     if(p['SHADOW_FRACTION']) {
                //         f.setStyle(getFeatureStyle(f, p['SHADOW_FRACTION']));
                //     }
                // });

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

            // map.on('pointermove', function(event) {
            //     unselectHighlightedFeatures();
            //     map.forEachFeatureAtPixel(event.pixel, function(feature) {
            //         if(feature.get('label')){
            //             feature.setStyle([featureStyleHover, selectedTextStyleFunction(feature.get('label'))]);
            //         } else {
            //             feature.setStyle(featureStyleHover);
            //         }
            //         highlightedFeatures.push(feature);
            //     });
            // });

            map.on('click', function(event) {
                //unselectPreviousFeatures();
                map.forEachFeatureAtPixel(event.pixel, function(feature) {
                    console.log(feature);
                    toggleSelectedFeature(feature);
                });
                scope.$apply();
            });

            scope.saveProperties = function() {
                // this is the changed input object, copy it to selected features, return the geojson of map
                console.log(scope.input.inputs); 
            };

            var selectMouseMove = new ol.interaction.Select({
                condition: ol.events.condition.mouseMove
            });

            map.addInteraction(selectMouseMove);

            scope.saveProperties = function() {
                console.log(scope.input.inputs);
            };

            // create directive, copy input.inputs to every selected feature
            var featurePanel = angular.element(
                '<div id="properties-panel" ng-show="selectedFeatures.length > 0" class="panel panel-default">' +
                    '<div class="panel-heading"><h2>{{selectedFeatures.length}} selected features</h2></div>' +
                    '<div class="panel-body"><kpi-input inputs=input.inputs></kpi-input></div>' +
                    '<div class="panel-footer clearfix">' +
                        '<div class="pull-right">' +
                            '<a ng-click="unselectAllFeatures()" class="btn btn-danger">Cancel</a>' +
                            '<a ng-click="saveProperties()" class="btn btn-succes">Save</a>' +
                        '</div>' +
                    '</div>' +
                '</div>');
            $compile(featurePanel)(scope);
            element.append(featurePanel);

            changeLayer('Road');


        }
    };
}]);