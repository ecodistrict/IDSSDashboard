angular.module('idss-dashboard').directive('geojsonMapInput', ['ProcessService', '$compile', 'ModuleService', function (ProcessService, $compile, ModuleService) {

    var uidCount = 1; // user this global variable to create temporary unique ids for features during editing

    var defaultProjection = 'EPSG:3857';

    var origData;

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

    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        template: '<div ng-transclude></div>',
        scope: {
            input: '='
        },
        link: function(scope, element, attrs) {

            // use the original inputs for default, userInput is the current selected building object
            scope.userInput = angular.copy(scope.input.inputs);

            scope.selectedFeatures = [];

            //console.log(scope.variantid);
            //console.log(scope.moduleid);
            //console.log(scope.input);

            // this function should be used to create a user input object that shows either
            // 1. a features' existing properties
            // 2. a span between the selected features values (TODO)
            // 3. the default input specified in module
            // right now it just uses the last selected features values
            var setUserInput = function() {

                _.each(scope.selectedFeatures, function(f) {

                    var properties = f.getProperties();

                    for(var input in scope.userInput) {
                        if(scope.userInput.hasOwnProperty(input)) {

                            console.log(properties);
                            console.log(input);
                            console.log(scope.userInput[input]);

                            // set to the properties set from feature or from default input
                            if(properties[input] || properties[input] === 0) {
                                scope.userInput[input].value = properties[input];
                            } else {
                                scope.userInput[input].value = scope.input.inputs[input].value;
                            }
                        }
                    }

                    console.log(scope.userInput);

                    f.setProperties(properties);

                });
                    
            };
            
            var toggleSelectedFeature = function(feature) {
                var found = _.find(scope.selectedFeatures, function(f){return f === feature;});
                if(found) {
                    setUserInput();
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
                    setUserInput();

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
                // set uid on every feature if not exists
                _.each(data.features, function(f) {
                    f.properties = f.properties || {};
                    f.properties.uid = f.properties.uid || uidCount;
                    for(var p in f.properties) {
                        if(!/^([A-Za-z0-9\-\_]+)$/.test(p)) {
                            alert('property ' + p + ' is not valid. This data cannot be saved in the database.');
                        } 
                    }
                    uidCount++;
                });
                // console.log('features uid was set');
                // console.log(data);
                // console.log(epsg);
                // if(origData) {
                //     _.each(origData.features, function(d, i) {
                //         var dataGeo = data.features[i].geometry;
                //         var origDataGeo = d.geometry;
                //         if(d.type !== data.features[i].type) {
                //             console.log(d.type, data.features[i].type);
                //         }
                //         if(dataGeo.type !== origDataGeo.type) {
                //             console.log(dataGeo.type, origDataGeo.type);
                //         }
                //         //if(dataGeo.coordinates.length !== origDataGeo.coordinates.length) {
                //             console.log(dataGeo.coordinates[0][0]);
                //             console.log(origDataGeo.coordinates[0][0]);
                //         //}
                //     });
                //     // console.log(origData);
                //     // console.log(data);
                //     //data = origData;    
                // }
                vectorSource = new ol.source.GeoJSON({
                    object:data,
                    projection: epsg
                });

                //console.log('setting new vector source');
                if(vectorLayer) {
                    map.removeLayer(vectorLayer);
                }
                vectorLayer = new ol.layer.Vector({
                  source: vectorSource,
                  style: featureStyleNormal
                });

                //origData = data;
                //console.log('creating new vector layer');
                // style geometries individually in output:

                // var features = vectorSource.getFeatures();

                // _.each(features, function(f) {
                //     var p = f.getProperties();
                //     if(p['SHADOW_FRACTION']) {
                //         f.setStyle(getFeatureStyle(f, p['SHADOW_FRACTION']));
                //     }
                // });

                map.addLayer(vectorLayer);
                //console.log('add vector layer to map');
                var extent = vectorLayer.getSource().getExtent();

                view.fitExtent(extent, map.getSize());
                //console.log('fit to extent');
            };

            // this watched the geojson data set if changed, for example if a new file was uploaded
            scope.$watch('input.value', function(newData, oldData) {
                if(oldData !== newData) {
                    //console.log(newData);
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
                    //console.log(feature.getProperties());
                    toggleSelectedFeature(feature);
                });
            });

            scope.unselectAllFeatures = function() {
                while(scope.selectedFeatures.length > 0) {
                    scope.selectedFeatures[scope.selectedFeatures.length-1].setStyle(null);
                    scope.selectedFeatures.pop();
                }
            };

            scope.saveProperties = function() {

                var geoJsonFormat = new ol.format.GeoJSON();
                
                _.each(scope.selectedFeatures, function(f) {
                    
                    var properties = f.getProperties();

                    for(var input in scope.userInput) {
                        if(scope.userInput.hasOwnProperty(input)) {
                            console.log(input);
                            properties[input] = scope.userInput[input].value;
                        }
                    }

                    f.setProperties(properties);
                });
                scope.unselectAllFeatures();

                var newInputValue = geoJsonFormat.writeFeatures(vectorSource.getFeatures(), {
                    //  dataProjection: defaultProjection,
                    featureProjection: defaultProjection
                });

                newInputValue.crs = {type: 'none'};


                initGeometryData(newInputValue);

                // the value of the input is being overridden by reference

                scope.input.value = newInputValue;

               
            };

            var selectMouseMove = new ol.interaction.Select({
                condition: ol.events.condition.mouseMove
            });

            map.addInteraction(selectMouseMove);

            // create directive, copy input.inputs to every selected feature
            var featurePanel = angular.element(
                '<div id="properties-panel" ng-show="selectedFeatures.length > 0" class="panel panel-default">' +
                    '<div class="panel-heading"><h2>{{selectedFeatures.length}} selected features</h2></div>' +
                    '<div class="panel-body"><kpi-input inputs=userInput></kpi-input></div>' +
                    '<div class="panel-footer clearfix">' +
                        '<div class="pull-right">' +
                            '<a ng-click="unselectAllFeatures()" class="btn btn-danger">Cancel</a>' +
                            '<a ng-click="saveProperties()" class="btn btn-succes">Ok</a>' +
                        '</div>' +
                    '</div>' +
                '</div>');
            $compile(featurePanel)(scope);
            element.append(featurePanel);

            changeLayer('Road');


        }
    };
}]);