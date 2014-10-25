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
            .error(function(status, data) {
                var label = 'Error when creating KPI';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var kpi = res.data;
                var label = 'KPI ' + kpi.name + ' was successfully created';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return kpi;
            });
    };

    var deleteKpi = function(kpiToDelete) {
        return $http
            .delete('kpis/' + kpiToDelete._id)
            .error(function(status, data) {
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
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return kpi;
            });
    };
   
    return {
        loadKpis: loadKpis,
        createKpi: createKpi,
        deleteKpi: deleteKpi
    };
}]);