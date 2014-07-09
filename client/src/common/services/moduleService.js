angular.module('idss-dashboard')

.factory('ModuleService', ['$http', function ($http) {

    var getModulesFromKpiId = function (kpiId) {
        return $http
            .get('/module/kpi/' + kpiId)
            .then(function (res) {
                return res.data;
            });
    };

    return {
        getModulesFromKpiId: getModulesFromKpiId
    };
}]);