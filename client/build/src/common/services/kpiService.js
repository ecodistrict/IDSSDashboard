angular.module('idss-dashboard')

.factory('KpiService', ['$http', function ($http) {

    var loadKpis = function () {
        return $http
            .get('/kpi')
            .then(function (res) {
                return res.data;
            });
    };
   
    return {
        loadKpis: loadKpis
    };
}]);