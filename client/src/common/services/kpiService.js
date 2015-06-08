angular.module('idss-dashboard')

.factory('KpiService', ['$http', 'NotificationService', function ($http, NotificationService) {

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
            })
            .then(function (res) {
                var kpi = res.data;
                var label = 'KPI ' + kpi.name + ' was successfully created';
                NotificationService.createSuccessFlash(label);
                return kpi;
            });
    };

    var deleteKpi = function(kpiToDelete) {
        return $http
            .delete('kpis/' + kpiToDelete._id)
            .error(function(data, status) {
                var label = 'Error when deleting KPI';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var kpi = res.data;
                var label = 'KPI ' + kpi.name + ' was successfully deleted';
                NotificationService.createSuccessFlash(label);
                return kpi;
            });
    };

    // // input needs to be from as-is variant
    // var getBadKpiValue = function(settings) {
    //     var bad = null;
    //     if(settings.bad || settings.bad === 0) {
    //         bad = settings.bad;
    //     } else {
    //         bad = 0; // qualitative KPI
    //     }
    //     return bad;
    // };

    // // input needs to be from as-is variant
    // var getExcellentKpiValue = function(settings) {
    //     var excellent = null;
    //     if(settings.excellent || settings.existing === 0) {
    //         excellent = settings.excellent;
    //     } else {
    //         excellent = 10; // qualitative KPI
    //     }
    //     return excellent;

    // };

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

    // This is the default configuration settings for qualitative KPI
    var generateQualitativeKpiSettings = function() {
        return [
            {
                label: "Score 10. Excellent",
                value: "Excellent",
                referenceValue: 10
            },
            {
                label: "Score 9",
                value: "",
                referenceValue: 9
            },
            {
                label: "Score 8",
                value: "",
                referenceValue: 8
            },
            {
                label: "Score 7",
                value: "",
                referenceValue: 7
            },
            {
                label: "Score 6. Sufficient",
                value: "Sufficient",
                referenceValue: 6
            },
            {
                label: "Score 5",
                value: "",
                referenceValue: 5
            },
            {
                label: "Score 4",
                value: "",
                referenceValue: 4
            },
            {
                label: "Score 3",
                value: "",
                referenceValue: 3
            },
            {
                label: "Score 2",
                value: "",
                referenceValue: 2
            },
            {
                label: "Score 1. Bad",
                value: "Bad",
                referenceValue: 1
            },
            {
                label: "Score 0. Not relevant",
                value: "Not relevant",
                referenceValue: 0
            }
        ];
    };

    // var generateQuantitativeKpiSettings = function(kpi) {

    //     kpi.settings = {
    //         bad: null,
    //         excellent: null
    //     };
    // };

    // var generatePriorityKpiInput = function(inputSpecification, priorityValue) {

    //     priorityValue = priorityValue || 3;

    //     inputSpecification["priorityLabel"] = {
    //         order: 1,
    //         type: 'inputGroup',
    //         label: 'Select how important this KPI is for you',
    //         info: 'Select a value between 1 - 5 where 1 is very important and 5 is not very important',
    //         inputs: {
    //             "priorityValue": {
    //                 type: 'number',
    //                 label: 'Priority 1 - 5',
    //                 value: priorityValue,
    //                 min: 1,
    //                 max: 5
    //             }
    //         }
    //     };
    // };

    // var generateToBeInput = function(asIsKpi, toBeKpi) {
    //     var bad;
    //     var excellent;
    //     var asIsKpiValue;

    //     // qualitative can be copied straight from the reference on server when saving
    //     if(!toBeKpi.qualitative) {
    //         if(asIsKpi && asIsKpi.inputSpecification && asIsKpi.inputSpecification.kpiValueInputGroup) {
    //             asIsKpiValue = asIsKpi.inputSpecification.kpiValueInputGroup.inputs.kpiValue.value;
    //         }
    //         bad = getBadKpiValue(asIsKpi.settings);
    //         excellent = getExcellentKpiValue(asIsKpi.settings);
    //         toBeKpi.inputSpecification = {
    //             "kpiValueInputGroup": {
    //                 type: 'inputGroup',
    //                 order: 0,
    //                 label: 'Select you ambition value for this KPI',
    //                 info: 'Select a value between ' +  bad + asIsKpi.unit + '(bad) and ' + excellent + asIsKpi.unit + ' (excellent)',
    //                 inputs: {
    //                     "kpiValue": {
    //                         type: 'number',
    //                         label: 'Ambition in ' + asIsKpi.unit,
    //                         min: bad < excellent ? bad : excellent,
    //                         unit: asIsKpi.unit,
    //                         max: excellent > bad ? excellent : bad,
    //                         value: asIsKpiValue
    //                     }
    //                 }
    //             }
    //         };
    //     } else {
    //         toBeKpi.inputSpecification = angular.copy(asIsKpi.inputSpecification);
    //     }
    // };

    // // for manual input as module results
    // // inputspec is overwritten so any code using this function must save a copy of the old spec and set it back after output has been generated
    // var generateManualInput = function(asIsKpi, moduleKpi) {
        
    //     var bad;
    //     var excellent;
    //     // qualitative can be copied straight from the reference on server when saving
    //     if(!moduleKpi.qualitative) {
    //         bad = getBadKpiValue(asIsKpi.settings);
    //         excellent = getExcellentKpiValue(asIsKpi.settings);
    //         moduleKpi.inputSpecification = {
    //             "kpiValueInputGroup": {
    //                 type: 'inputGroup',
    //                 order: 0,
    //                 label: 'Select manual result for this module',
    //                 info: 'Select a value between ' +  bad + asIsKpi.unit + '(bad) and ' + excellent + asIsKpi.unit + ' (excellent)',
    //                 inputs: {
    //                     "kpiValue": {
    //                         type: 'number',
    //                         label: 'Value in ' + asIsKpi.unit,
    //                         min: bad < excellent ? bad : excellent,
    //                         unit: asIsKpi.unit,
    //                         max: excellent > bad ? excellent : bad
    //                     }
    //                 }
    //             }
    //         };
    //     }
    // };

    var generateQualitativeKpiOutput = function(inputSpecification) {

        var radioInputs;
        var kpiValue = null, outputs = false;


        if(inputSpecification && inputSpecification.kpiScores && inputSpecification.kpiScores.inputs) {
            radioInputs = inputSpecification.kpiScores.inputs;

            for(var input in radioInputs) {
                if(radioInputs.hasOwnProperty(input)) {
                    if(radioInputs[input].value || radioInputs[input].value === 0) {
                        kpiValue = radioInputs[input].value; // every value in a radio button is the same for now (the duplicated selected value), // TODO: change input spec for radio
                    }
                }
            }

            if(kpiValue || kpiValue === 0) {
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

    var getKpiRecord = function(variantId, kpiAlias, userId) {

        var uri = userId ? 'kpirecords/' + variantId + '/' + kpiAlias + '/' + userId : 'kpirecords/' + variantId + '/' + kpiAlias + '/';

        return $http
            .get(uri)
            .error(function(data, status) {
                var label = 'Error when loading outputs';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var records = res.data;

                if(!records || records.length === 0) {
                    records = [
                        {
                            alias: kpiAlias,
                            variantId: variantId,
                            status: 'unprocessed'
                        }
                    ];
                } else if(records.length > 1) {
                    var label = 'Several records exists';
                    NotificationService.createErrorFlash(label);
                    console.log(label);
                } 
                return records[0];
            });
    };

    var updateKpiRecord = function(kpiToUpdate) {
        return $http
            .put('kpirecords', kpiToUpdate)
            .error(function(status, err) {
                var label = 'Error when saving kpi';
                NotificationService.createErrorStatus(label);
            })
            .then(function (res) {
                var savedKpiRecord = res.data;
                var label = 'Kpi was saved';
                NotificationService.createSuccessStatus(label);
                return savedKpiRecord;
            });
    };

    var removeExtendedData = function(kpi) {
        delete kpi._id;
        delete kpi.value;
    };

    var getAllKpiRecords = function() {
        return $http
            .get('kpirecords')
            .error(function(data, status) {
                var label = 'Error when loading records';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var records = res.data;
                return records;
            });
    };

    return {
        loadKpis: loadKpis,
        createKpi: createKpi,
        deleteKpi: deleteKpi,
        getKpiRecord: getKpiRecord,
        updateKpiRecord: updateKpiRecord,
        removeExtendedData: removeExtendedData,
        getAllKpiRecords: getAllKpiRecords,
        generateQualitativeKpiOutput: generateQualitativeKpiOutput,
        generateQuantitativeKpiOutput: generateQuantitativeKpiOutput,
        generateQualitativeKpiSettings: generateQualitativeKpiSettings,
        //generateQuantitativeKpiSettings: generateQuantitativeKpiSettings,
        //generateToBeInput: generateToBeInput,
        //generateManualInput: generateManualInput,
        generateSettings: generateSettings
    };
}]);