angular.module('idss-dashboard').directive('geojsonMapOutput', ['ProcessService', '$compile', 'ModuleService', function (ProcessService, $compile, ModuleService) {

    var defaultProjection = 'EPSG:3857';

    // KPI limits
    var excellent = null;
    var bad = null;

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

    var getFeatureStyle = function(feature, property) {
        var color = greenYellowRed(property);
        
        return new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: 'rgba(' + color + ', 1)',
                width: 1
            }),
            fill: new ol.style.Fill({
                color: 'rgba(' + color + ', 0.5)'
            })
        });
    };

    // use for colorizing output
    // TODO: clean this mess up!
    var greenYellowRed = function(kpiValue) {
        if(!bad || !excellent) {
            return;
        }
        var span = Math.abs(bad - excellent);
        var average = span / 2;
        // if value is out of bounds, set it to bad or excellent
        if(kpiValue < Math.min(bad, excellent)) {
            kpiValue = Math.min(bad, excellent);
        } else if(kpiValue > Math.max(bad, excellent)) {
            kpiValue = Math.max(bad, excellent);
        }
        var value = Math.abs(kpiValue - Math.min(bad, excellent));
        var factor = value / span;

        if (value < average) {
            // green to yellow
            $r = Math.floor(255 * factor);
            $g = 255;

        } else {
            // yellow to red
            $r = 255;
            $g = Math.floor(255 - (255 * factor));
        }
        $b = 0;

        return $r + ',' + $g + ',' + $b;
    };

    return {
        restrict: 'E',
        scope: {
            output: '=',
            inputs: '='
        },
        link: function(scope, element, attrs) {

            scope.selectedFeatures = [];
            scope.featureProperties = [];

            console.log(scope.inputs);
            console.log(scope.output);

            if(scope.inputs) {
                var kpiScores = _.find(scope.inputs, function(input) {return input.id === 'kpi-scores';});
                if(kpiScores && kpiScores.inputs) {
                    // assume order
                    excellent = kpiScores.inputs[0].value;
                    bad = kpiScores.inputs[1].value;
                }
            }
            
            var setFeatureProperty = function(feature) {

                scope.featureProperties = [];
                var properties = feature.getProperties();
                _.each(scope.output.displayProperties, function(property) {
                    if(properties[property.property]) {
                        property.value = properties[property.property];
                        scope.featureProperties.push(property);
                    }
                });

                //scope.featureProperties = feature.getProperties();
                    
            };

            var toggleSelectedFeature = function(feature) {
                var found = _.find(scope.selectedFeatures, function(f){return f === feature;});
                if(found) {
                    found.setStyle(feature.savedStyle);
                    var index = scope.selectedFeatures.indexOf(found);
                    scope.selectedFeatures.splice(index, 1);  
                    if(scope.selectedFeatures.length === 0) {
                        scope.featureProperties = null;
                    }
                } else {

                    // style for showing certain property (use for output)
                    
                    var properties = feature.getProperties();
                    feature.savedStyle = feature.getStyle();
                    feature.setStyle(featureStyleSelected);
                    scope.selectedFeatures.push(feature);

                }
                setFeatureProperty(feature);
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
            var vectorLayer;
            var vectorSource;

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
                // default projection
                var epsg = defaultProjection;
                if(data.crs && data.crs.properties && data.crs.properties.name) {
                    epsg = data.crs.properties.name;
                }

                console.log('projection was set');
                
                console.log('features uid was set');
                console.log(data);
                console.log(epsg);
                
                vectorSource = new ol.source.GeoJSON({
                    object:data,
                    projection: epsg
                });

                console.log('setting new vector source');
                if(vectorLayer) {
                    map.removeLayer(vectorLayer);
                }
                vectorLayer = new ol.layer.Vector({
                  source: vectorSource,
                  style: featureStyleNormal
                });

                var features = vectorSource.getFeatures();
                _.each(features, function(f) {

                    var properties = f.getProperties();
                    if(properties[scope.output.kpiProperty]) {
                        f.setStyle([getFeatureStyle(f, properties[scope.output.kpiProperty])]);
                        //f.setStyle([getFeatureStyle(f, properties.SHADOW_FRACTION), selectedTextStyleFunction(properties.SHADOW_FRACTION)]);
                    } else {
                        f.setStyle(featureStyleNormal);
                    }

                });

                console.log('creating new vector layer');

                map.addLayer(vectorLayer);
                console.log('add vector layer to map');
                var extent = vectorLayer.getSource().getExtent();

                view.fitExtent(extent, map.getSize());
                console.log('fit to extent');
            };

            // this watched the geojson data set if changed, for example if a new file was uploaded
            scope.$watch('input.value', function(newData, oldData) {
                if(oldData !== newData) {
                    console.log(newData);
                    initGeometryData(newData);
                }
            });

            if(scope.output.value) {
                initGeometryData(scope.output.value);
            }

            map.on('click', function(event) {
                //unselectPreviousFeatures();
                map.forEachFeatureAtPixel(event.pixel, function(feature) {
                    console.log(feature.getProperties());
                    toggleSelectedFeature(feature);
                });
                scope.$apply();
            });

            scope.unselectAllFeatures = function() {
                while(scope.selectedFeatures.length > 0) {
                    scope.selectedFeatures[scope.selectedFeatures.length-1].setStyle(scope.selectedFeatures[scope.selectedFeatures.length-1].savedStyle);
                    scope.selectedFeatures.pop();
                }
                scope.featureProperties = null;
            };

            var selectMouseMove = new ol.interaction.Select({
                condition: ol.events.condition.mouseMove
            });

            map.addInteraction(selectMouseMove);

            // create directive, copy input.inputs to every selected feature
            var featurePanel = angular.element([
                '<div id="properties-panel" ng-show="featureProperties.length > 0" class="panel panel-default">',
                    '<div class="panel-heading"><h2>{{selectedFeatures.length}} selected features</h2></div>',
                    '<div class="panel-body">',
                        '<p ng-repeat="property in featureProperties">',
                            '<b>{{property.label}}: </b> {{property.value}}',
                        '</p>',
                    '</div>',
                    '<div class="panel-footer clearfix">',
                        '<div class="pull-right">',
                            '<a ng-click="unselectAllFeatures()" class="btn btn-primary">Ok</a>',
                        '</div>',
                    '</div>',
                '</div>'].join(''));
            $compile(featurePanel)(scope);
            element.append(featurePanel);

            changeLayer('Road');


        }
    };
}]);