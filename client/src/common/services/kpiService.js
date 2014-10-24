angular.module('idss-dashboard')

.factory('KpiService', ['$http', function ($http) {

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
            .then(function (res) {
                var kpi = res.data;
                return kpi;
            });
    };
   
    return {
        loadKpis: loadKpis,
        createKpi: createKpi
    };
}]);