angular.module('idss-dashboard')

.factory('KpiService', ['$http', 'NotificationService', 'ProcessService', 'ModuleService', function ($http, NotificationService, ProcessService, ModuleService) {

    var loadKpis = function () {
        return $http
            .get('/kpis')
            .then(function (res) {
                return res.data;
            });
    };

    var createKpi = function(kpiToCreate) {
        return $http
            .post('kpis', kpiToCreate)
            .error(function(data, status) {
                var label = 'Error when creating KPI';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var kpi = res.data;
                var label = 'KPI ' + kpi.name + ' was successfully created';
                NotificationService.createSuccessFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return kpi;
            });
    };

    var deleteKpi = function(kpiToDelete) {
        return $http
            .delete('kpis/' + kpiToDelete._id)
            .error(function(data, status) {
                var label = 'Error when deleting KPI';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var kpi = res.data;
                var label = 'KPI ' + kpi.name + ' was successfully deleted';
                NotificationService.createSuccessFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return kpi;
            });
    };

    // input needs to be from as-is variant
    var getBadKpiValue = function(inputSpec) {
        var bad = null;
        if(inputSpec.kpiScores && inputSpec.kpiScores.inputs) {
            // this is a quantitative KPI
            if(inputSpec.kpiScores.inputs.kpiScoreBad){
                bad = inputSpec.kpiScores.inputs.kpiScoreBad.value;
            } else {
                // this is a qualitative KPI
                bad = 1;
            }
        }
        return bad;
    };

    // input needs to be from as-is variant
    var getExcellentKpiValue = function(inputSpec) {
        var excellent = null;
        if(inputSpec.kpiScores && inputSpec.kpiScores.inputs) {
            // this is a quantitative KPI
            if(inputSpec.kpiScores.inputs.kpiScoreExcellent) {
                excellent = inputSpec.kpiScores.inputs.kpiScoreExcellent.value;
            } else {
                // this is a qualitative KPI
                excellent = 10;
            }
        }
        return excellent;

    };

    var getResultKpiValue = function(kpi, cb) {
        if(kpi.qualitative) {
            //if(!kpi.outputs) {
                kpi.outputs = generateQualitativeKpiOutput(kpi.inputSpecification);
            //}
            if(kpi.outputs && kpi.outputs.length > 0) {
                cb(kpi.outputs[0].value);
            }
        } else {
            if(!kpi.outputs) {
                console.log('quantitative outputs not exist');
                console.log(kpi);
            } else {
                cb(_.find(kpi.outputs, function(o) {return o.type === 'kpi';}).value);
            }
        }
    };

    var generateSettings = function(kpi) {
        var existingPrio;
        if(kpi.settings.priorityLabel) {
            existingPrio = kpi.settings.priorityLabel.inputs.priorityValue.value;
        }

        generatePriorityKpiInput(kpi.settings, existingPrio);
    };

    var generateQualitativeKpiInput = function(kpi, scoreInputs) {

        // set given scores or default
        scoreInputs = scoreInputs || {
            "kpiScore1": {
              label: "Bad",
              type: 'radio',
              name: kpi.alias,
              order: 1,
              referenceValue: 1
            },
            "kpiScore6": {
              label: "Sufficient",
              type: 'radio',
              name: kpi.alias,
              order: 6,
              referenceValue: 6
            },
            "kpiScore10": {
              label: "Excellent",
              type: 'radio',
              name: kpi.alias,
              order: 10,
              referenceValue: 10
            }
        };

        kpi.settings["kpiScores"] = {
                order: 0,
                type: 'inputGroup',
                label: 'This is a preview, edit the options by pressing "Edit KPI values" above',
                info: 'Info',
                inputs: scoreInputs
        };

    };

    var generatePriorityKpiInput = function(inputSpecification, priorityValue) {

        priorityValue = priorityValue || 3;

        inputSpecification["priorityLabel"] = {
            order: 1,
            type: 'inputGroup',
            label: 'Select how important this KPI is for you',
            info: 'Select a value between 1 - 5 where 1 is very important and 5 is not very important',
            inputs: {
                "priorityValue": {
                    type: 'number',
                    label: 'Priority 1 - 5',
                    value: priorityValue,
                    min: 1,
                    max: 5
                }
            }
        };
    };

    var generateQuantitativeKpiInput = function(kpi) {
        
        kpi.settings["kpiScores"] = {
                order: 0,
                type: 'inputGroup',
                label: 'Limits - define the scores',
                info: 'Info about scores',
                inputs: {
                    "kpiScoreExcellent": {
                        label: 'Excellent',
                        type: 'number',
                        unit: kpi.unit
                    },
                    "kpiScoreBad": {
                        label: 'Bad',
                        type: 'number',
                        unit: kpi.unit
                    }
                }
        };
    };

    var generateToBeInput = function(asIsKpi, toBeKpi) {
        var bad;
        var excellent;
        // qualitative can be copied straight from the reference on server when saving
        if(!toBeKpi.qualitative) {
            bad = getBadKpiValue(asIsKpi.settings);
            excellent = getExcellentKpiValue(asIsKpi.settings);
            toBeKpi.inputSpecification = {
                "kpiValueInputGroup": {
                    type: 'inputGroup',
                    order: 0,
                    label: 'Select you ambition value for this KPI',
                    info: 'Select a value between ' +  bad + asIsKpi.unit + '(bad) and ' + excellent + asIsKpi.unit + ' (excellent)',
                    inputs: {
                        "kpiValue": {
                            type: 'number',
                            label: 'Ambition in ' + asIsKpi.unit,
                            min: bad < excellent ? bad : excellent,
                            unit: asIsKpi.unit,
                            max: excellent > bad ? excellent : bad
                        }
                    }
                }
            };
        } else {
            toBeKpi.inputSpecification = asIsKpi.settings;
        }
    };

    // for manual input as module results
    // inputspec is overwritten so any code using this function must save a copy of the old spec and set it back after output has been generated
    var generateManualInput = function(asIsKpi, moduleKpi) {
        
        var bad;
        var excellent;
        // qualitative can be copied straight from the reference on server when saving
        if(!moduleKpi.qualitative) {
            bad = getBadKpiValue(asIsKpi.settings);
            excellent = getExcellentKpiValue(asIsKpi.settings);
            moduleKpi.inputSpecification = {
                "kpiValueInputGroup": {
                    type: 'inputGroup',
                    order: 0,
                    label: 'Select manual result for this module',
                    info: 'Select a value between ' +  bad + asIsKpi.unit + '(bad) and ' + excellent + asIsKpi.unit + ' (excellent)',
                    inputs: {
                        "kpiValue": {
                            type: 'number',
                            label: 'Value in ' + asIsKpi.unit,
                            min: bad < excellent ? bad : excellent,
                            unit: asIsKpi.unit,
                            max: excellent > bad ? excellent : bad
                        }
                    }
                }
            };
        }
    };

    var copyQualitativeKpiInputFromSettings = function(copyToKpi, asIsKpi) {
        var scores, existingScore;
        if(copyToKpi.inputSpecification && copyToKpi.inputSpecification.kpiScores) {
            existingScore = copyToKpi.inputSpecification.kpiScores.inputs.kpiScore1.value;// all values are the same - the selected value
        }
        // TODO: find a nicer way to deep copy this..
        copyToKpi.inputSpecification = copyToKpi.inputSpecification || {};
        copyToKpi.inputSpecification.kpiScores = angular.copy(asIsKpi.settings.kpiScores);
        copyToKpi.inputSpecification.kpiScores.inputs = angular.copy(asIsKpi.settings.kpiScores.inputs);
        copyToKpi.inputSpecification.kpiScores.label = "Select an option";
        scores = copyToKpi.inputSpecification.kpiScores.inputs;
        for(var i in scores) {
            if(scores.hasOwnProperty(i)) {
                scores[i] = angular.copy(scores[i]);
                scores[i].value = existingScore;
            }
        }
    };

    var generateQualitativeKpiOutput = function(inputSpecification) {

        var radioInputs;
        var kpiValue = null, outputs = false;


        if(inputSpecification && inputSpecification.kpiScores && inputSpecification.kpiScores.inputs) {
            radioInputs = inputSpecification.kpiScores.inputs;

            for(var input in radioInputs) {
                if(radioInputs.hasOwnProperty(input)) {
                    if(radioInputs[input].value) {
                        kpiValue = radioInputs[input].value; // every value in a radio button is the same for now (the duplicated selected value), // TODO: change input spec for radio
                    }
                }
            }

            if(kpiValue) {
                outputs = [{
                  "type": "kpi",
                  "value": kpiValue,
                  "info": "Kpi result"
                }];
            }
        }

        return outputs;
    };

    // this is generated for the to be situation but could be used as manual output generation when module fails
    var generateQuantitativeKpiOutput = function(inputSpecification) {

        var kpiValue = null, outputs = false;

        kpiValue = inputSpecification.value;

        if(kpiValue) {
            outputs = [{
              "type": "kpi",
              "value": kpiValue,
              "info": "Kpi result"
            }];
        }

        return outputs;
    };

    // set outputs on the kpi
    var initOutputs = function(currentVariant, asIsVariant, kpiMapOutputs) {
        _.each(currentVariant.kpiList, function(kpi) {
          var asIsKpi = _.find(asIsVariant.kpiList, function(k) { return k.alias === kpi.alias;});
          if(asIsKpi) {
              kpi.bad = getBadKpiValue(asIsKpi.settings);
              kpi.excellent = getExcellentKpiValue(asIsKpi.settings);
              kpi.unit = kpi.unit || 'score';
              kpi.status = 'loading';
              kpi.outputs = null; // manual output can exist (saved or cached), to avoid extra rendering wait for init of outputs below
              kpi.loading = true;
              
              if(kpi.qualitative) {
                kpi.moduleName = 'Qualitative KPI';
                // returns null if score was not given to this kpi
                kpi.outputs = generateQualitativeKpiOutput(kpi.inputSpecification);
                kpi.status = kpi.outputs ? 'success' : 'unprocessed';
                kpi.loading = false;

              } else {
                if(currentVariant.type === 'to-be') {
                    kpi.moduleName = kpi.selectedModule.name || 'Ambition';
                    if(kpi.inputSpecification.kpiValueInputGroup) {
                        kpi.outputs = generateQuantitativeKpiOutput(kpi.inputSpecification.kpiValueInputGroup.inputs.kpiValue);
                    }
                    kpi.status = kpi.outputs ? 'success' : 'unprocessed';
                    kpi.loading = false;
                } else if(kpi.selectedModule.id && !kpi.manual) {
                    // try to fetch a module output if a module has been selected
                    // if manual has been set this is prioritized, a kpi must be recalculated to override this
                  kpi.moduleName = kpi.selectedModule.name;
                  kpi.moduleId = kpi.selectedModule.id;
                  ModuleService.getModuleOutput(currentVariant._id, kpi.selectedModule.id, kpi.alias).then(function(output) {
                      kpi.status =  output.status; 
                      if(kpi.status === 'initializing' || kpi.status === 'processing') {
                        kpi.loading = true;
                      } else {
                        kpi.loading = false;
                      }

                      _.each(output.outputs, function(o) {
                        o.alias = kpi.alias;
                        o.kpiName = kpi.name;
                        o.kpiBad = kpi.bad;
                        o.kpiExcellent = kpi.excellent;
                        o.kpiUnit = kpi.unit;
                        o.moduleId = kpi.moduleId;
                        if(o.type === 'geojson' && kpiMapOutputs) {
                          // TODO: update any existing map output, use id?
                          kpiMapOutputs.push(o);
                        }
                      });

                      kpi.outputs = output.outputs; // listen on this to trigger rendering
                  });
                } else {
                  kpi.moduleName = kpi.selectedModule.name || 'Manual input (no module selected)';
                  // try to set any manual given values, null if not found
                  if(kpi.inputSpecification && kpi.inputSpecification.kpiValueInputGroup) {
                      kpi.outputs = generateQuantitativeKpiOutput(kpi.inputSpecification.kpiValueInputGroup.inputs.kpiValue);
                  }
                  kpi.status = kpi.outputs ? 'success' : 'unprocessed';
                  kpi.loading = false;
                }
              }
          } else {
            console.warn('WARNING: As is version of KPI did not exist');
          }
        });
        return currentVariant;
    };
   
    return {
        loadKpis: loadKpis,
        createKpi: createKpi,
        deleteKpi: deleteKpi,
        getBadKpiValue: getBadKpiValue,
        getExcellentKpiValue: getExcellentKpiValue,
        getResultKpiValue: getResultKpiValue,
        generateQualitativeKpiOutput: generateQualitativeKpiOutput,
        generateQuantitativeKpiOutput: generateQuantitativeKpiOutput,
        generateQualitativeKpiInput: generateQualitativeKpiInput,
        generateQuantitativeKpiInput: generateQuantitativeKpiInput,
        generateToBeInput: generateToBeInput,
        generateManualInput: generateManualInput,
        generateSettings: generateSettings,
        copyQualitativeKpiInputFromSettings: copyQualitativeKpiInputFromSettings,
        initOutputs: initOutputs
    };
}]);