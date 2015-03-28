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
   
    return {
        loadKpis: loadKpis,
        createKpi: createKpi,
        deleteKpi: deleteKpi,
        generateQualitativeKpiOutput: generateQualitativeKpiOutput
    };
}]);