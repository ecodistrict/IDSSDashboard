angular.module('idss-dashboard').directive('geojsonMapOutput', ['ProcessService', '$compile', 'ModuleService', '$timeout', function (ProcessService, $compile, ModuleService, $timeout) {

    var defaultProjection = 'EPSG:3857';

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

    var getFeatureStyle = function(feature, property, bad, excellent) {
        var color = greenYellowRed(property, bad, excellent);
        
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
    var greenYellowRed = function(kpiValue, bad, excellent) {
        if((!bad && bad !== 0) || (!excellent && excellent !== 0)) {
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
        var value = kpiValue - Math.min(bad, excellent);
        var factor = value / span;
        var badIsLarger = false;

        if(bad > excellent) {
            badIsLarger = true;
        }

        if ((value < average && !badIsLarger) || (value > average && !badIsLarger)) {
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
            outputs: '=',
            trig: '='
        },
        link: function(scope, element, attrs) {

            // wrap the execution in a function to wait for dom to be ready
            // TODO: this is not a nice solution, maybe use http://buzzdecafe.github.io/2014/03/20/directive-after-dom/
            // TODO: examine also precompile vs default postcompile
            function initMap() {

                $timeout(function() {

                    scope.selectedFeatures = [];
                    scope.featureProperties = [];
                    console.log('geojsonmapoutput');
                    console.log(scope.outputs);

                    var setFeatureProperty = function(feature) {

                        //scope.featureProperties = [];
                        var properties = feature.getProperties();
                        var set = {};
                        console.log(properties);
                        // _.each(scope.output.displayProperties, function(property) {
                        //     if(properties[property.property]) {
                        //         property.value = properties[property.property];
                        //         scope.featureProperties.push(property);
                        //     }
                        // });
                        for(var p in properties) {
                            if(properties.hasOwnProperty(p)) {
                                set[p] = properties[p];
                            }
                        }

                        scope.featureProperties = set;
                            
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

                    console.log(element);

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
                    var vectorLayers = [];
                    var vectorSource;

                    var zoomslider = new ol.control.ZoomSlider();
                    map.addControl(zoomslider);

                    var changeLayer = function(layer) {
                        for (var i = 0; i < layers.length; i++) {
                            layers[i].set('visible', (layers[i].get('style') === layer));
                        }
                    };

                    var initGeometryData = function(data) {
                        console.log(data);  

                        if(!data) {
                            return;
                        }

                        // TODO: Add a new vector layer for this data

                        // default projection
                        var epsg = defaultProjection;
                        if(data.value.crs && data.value.crs.properties && data.value.crs.properties.name) {
                            epsg = data.value.crs.properties.name;
                        }

                        console.log('projection was set');
                        
                        console.log('features uid was set');
                        console.log(data.value);
                        console.log(epsg);
                        
                        var vectorSource = new ol.source.GeoJSON({
                            object:data.value,
                            projection: epsg
                        });

                        console.log('setting new vector source');
                        
                        var vectorLayer = new ol.layer.Vector({
                          source: vectorSource,
                          style: featureStyleNormal
                        });

                        vectorLayers.push({vectorLayer: vectorLayer, vectorSource: vectorSource});

                        var features = vectorSource.getFeatures();

                        _.each(features, function(f) {

                            var properties = f.getProperties();
                            if(properties[data.kpiProperty]) {
                                f.setStyle([getFeatureStyle(f, properties[data.kpiProperty], data.kpiBad, data.kpiExcellent)]);
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

                    scope.$watchCollection('outputs', function(newOutputs, oldOutputs) {
                        // ignore first run, when undefined
                        if(newOutputs && newOutputs.length) {


                            console.log(newOutputs);

                            initGeometryData(newOutputs[newOutputs.length - 1]);
                            // elementWidth = 0; 
                            // // if output changed
                            // if(oldOutputs && oldOutputs.length === newOutputs.length) {
                            //     _.each(newOutputs, function(output, i) {
                            //         if(output !== oldOutputs[i]) {
                            //             console.log(output.type);
                            //             if(output.type === 'geojson') {
                            //                 render(output);
                            //             }
                            //         }
                            //     });
                            // } else {
                            //     // TODO: bad solution, fix this
                            //     // if output was added
                            //     _.each(newOutputs, function(output, i) {
                            //         if(output.type === 'geojson') {
                            //             render(output);
                            //         }
                            //     });

                            // }
                        }
                    });

                    // if(scope.output.value) {
                    //     initGeometryData(scope.output.value);
                    // }

                    map.on('click', function(event) {
                        //unselectPreviousFeatures();
                        map.forEachFeatureAtPixel(event.pixel, function(feature) {
                            //console.log(feature.getProperties());
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
                        '<div id="properties-panel" ng-show="selectedFeatures.length > 0" class="panel panel-default">',
                            '<div class="panel-heading"><h2>Selected feature</h2></div>',
                            '<div class="panel-body">',
                                '<p ng-repeat="(key, property) in featureProperties">',
                                    '<b>{{key}}: </b> {{property}}',
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
                }, 200);
            }

            //initMap();

            scope.watch('trig', function(newValue, oldValue) {
                //console.log('trig');
                //element.html('').append('<p style="position:absolute;width:500px;height:500px;z-index:9999">TEst</p>');
                if(newValue && newValue !== oldValue) {
                    element.html('');
                    initMap();
                }
            });


        }
    };
}]);