angular.module('idss-dashboard')

.factory('ModuleService', ['$http', function ($http) {

    var getModulesFromKpiId = function (kpiId) {
        return $http
            .get('/module/kpi/' + kpiId)
            .then(function (res) {
                return res.data;
            });
    };

    var getAllModules = function() {
        return $http
            .get('/module')
            .then(function (res) {
                return res.data;
            });
    };

    return {
        getModulesFromKpiId: getModulesFromKpiId,
        getAllModules: getAllModules
    };
}]);