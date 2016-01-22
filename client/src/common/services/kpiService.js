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

    var updateKpi = function(kpiToUpdate) {
        return $http
            .put('kpis', kpiToUpdate)
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

    // var getKpiRecord = function(variantId, kpiAlias, userId) {

    //     var uri = userId ? 'kpirecords/' + variantId + '/' + kpiAlias + '/' + userId : 'kpirecords/' + variantId + '/' + kpiAlias + '/';

    //     return $http
    //         .get(uri, {cache: false})
    //         .error(function(data, status) {
    //             var label = 'Error when loading outputs';
    //             NotificationService.createErrorFlash(label);
    //         })
    //         .then(function (res) {
    //             var records = res.data;

    //             if(!records || records.length === 0) {
    //                 records = [
    //                     {
    //                         alias: kpiAlias,
    //                         variantId: variantId,
    //                         status: 'unprocessed'
    //                     }
    //                 ];
    //             } else if(records.length > 1) {
    //                 var label = 'Several records exists';
    //                 NotificationService.createErrorFlash(label);
    //                 console.log(label);
    //             } 
    //             return records[0];
    //         });
    // };

    // var updateKpiRecord = function(kpiToUpdate) {
    //     return $http
    //         .put('kpirecords', kpiToUpdate)
    //         .error(function(status, err) {
    //             var label = 'Error when saving kpi';
    //             NotificationService.createErrorStatus(label);
    //         })
    //         .then(function (res) {
    //             var savedKpiRecord = res.data;
    //             var label = 'Kpi was saved';
    //             NotificationService.createSuccessStatus(label);
    //             return savedKpiRecord;
    //         });
    // };

    var removeExtendedData = function(kpi) {
        delete kpi._id;
        delete kpi.value;
        delete kpi.disabled;
    };

    // var getAllKpiRecords = function() {
    //     return $http
    //         .get('kpirecords')
    //         .error(function(data, status) {
    //             var label = 'Error when loading records';
    //             NotificationService.createErrorFlash(label);
    //         })
    //         .then(function (res) {
    //             var records = res.data;
    //             return records;
    //         });
    // };

    // var deleteKpiRecords = function(kpi) {
    //     return $http
    //         .delete('kpirecords/byKpiAlias/' + kpi.kpiAlias)
    //         .error(function(data, status) {
    //             var label = 'Error when deleting KPI records';
    //             NotificationService.createErrorFlash(label);
    //         })
    //         .then(function (res) {
    //             var kpi = res.data;
    //             var label = 'KPI records was successfully deleted';
    //             NotificationService.createSuccessFlash(label);
    //             return kpi;
    //         });
    // };

    var getBad = function(sufficient, excellent) {

        if((!excellent && excellent !== 0) || (!sufficient && sufficient !== 0)) {
            return 0;
        } 
        // span is a 6 out of 10
        var span = Math.abs(sufficient - excellent) * 1.5;
        if(sufficient >= excellent) {
            return sufficient + span;
        } else {
            return sufficient - span;
        }
    };

    var getMin = function(bad, sufficient, excellent, value) {
      sufficient = (sufficient || sufficient === 0) ? sufficient : Infinity;
      excellent = (excellent || excellent === 0) ? excellent : Infinity;
      value = (value || value === 0) ? value : Infinity;
      return Math.min(bad, Math.min(sufficient, Math.min(excellent, value)));
    };

    var getMax = function(bad, sufficient, excellent, value) {
      sufficient = (sufficient || sufficient === 0) ? sufficient : -Infinity;
      excellent = (excellent || excellent === 0) ? excellent : -Infinity;
      value = (value || value === 0) ? value : -Infinity;
      return Math.max(bad, Math.max(sufficient, Math.max(excellent, value)));
    };

    var setKpiColor = function(kpi) {
        var sufficient = kpi.sufficient,
            excellent = kpi.excellent,
            value = kpi.value,
            bad = getBad(sufficient, excellent),
            min = getMin(bad, sufficient, excellent, value),
            max = getMax(bad, sufficient, excellent, value),
            right, left, color;
        
        if(excellent < sufficient) {
            left = max;
            right = min;
        } else {
            left = min;
            right = max;
        }

        color = d3.scale.linear()
            .domain([left, (left+right)*0.5, right])
            .range(["red", "yellow", "green"]);

        kpi.color = color(value);
    };

    return {
        loadKpis: loadKpis,
        createKpi: createKpi,
        deleteKpi: deleteKpi,
        updateKpi: updateKpi,
        //getKpiRecord: getKpiRecord,
        //updateKpiRecord: updateKpiRecord,
        removeExtendedData: removeExtendedData,
        //getAllKpiRecords: getAllKpiRecords,
        generateQualitativeKpiOutput: generateQualitativeKpiOutput,
        generateQuantitativeKpiOutput: generateQuantitativeKpiOutput,
        generateQualitativeKpiSettings: generateQualitativeKpiSettings,
        //deleteKpiRecords: deleteKpiRecords,
        getBad: getBad,
        getMin: getMin,
        getMax: getMax,
        setKpiColor: setKpiColor,
        generateSettings: generateSettings
    };
}]);