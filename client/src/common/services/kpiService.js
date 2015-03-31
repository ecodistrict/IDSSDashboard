angular.module('idss-dashboard')

.factory('KpiService', ['$http', 'NotificationService', 'ProcessService', function ($http, NotificationService, ProcessService) {

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

    var generateQualitativeKpiOutput = function(inputSpecification) {

        var kpiValue = null, outputs = false;

        for(var input in inputSpecification) {
            if(inputSpecification.hasOwnProperty(input)) {
                if(inputSpecification[input].value) {
                    kpiValue = inputSpecification[input].value; // every value in a radio button is the same for now (the duplicated selected value), // TODO: change input spec for radio
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

        return outputs;
    };

    // this is generated for the to be situation but could be used as manual output generation when module fails
    var generateQuantitativeKpiOutput = function(inputSpecification) {

        console.log(inputSpecification);

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

    var generateToBeInput = function(asIsKpi, toBeKpi) {
        var bad;
        var excellent;
        // qualitative can be copied straight from the reference on server when saving
        if(!toBeKpi.qualitative) {
            bad = getBadKpiValue(asIsKpi.inputSpecification);
            excellent = getExcellentKpiValue(asIsKpi.inputSpecification);
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
        }
    };

    var generateManualInput = function(asIsKpi, moduleKpi) {
        var bad;
        var excellent;
        // qualitative can be copied straight from the reference on server when saving
        if(!moduleKpi.qualitative) {
            bad = getBadKpiValue(asIsKpi.inputSpecification);
            excellent = getExcellentKpiValue(asIsKpi.inputSpecification);
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
   
    return {
        loadKpis: loadKpis,
        createKpi: createKpi,
        deleteKpi: deleteKpi,
        getBadKpiValue: getBadKpiValue,
        getExcellentKpiValue: getExcellentKpiValue,
        generateQualitativeKpiOutput: generateQualitativeKpiOutput,
        generateQuantitativeKpiOutput: generateQuantitativeKpiOutput,
        generateToBeInput: generateToBeInput,
        generateManualInput: generateManualInput
    };
}]);