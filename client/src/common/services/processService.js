angular.module('idss-dashboard')

.factory('ProcessService', ['$http', function ($http) {

    var currentProcess = {
        district: {
            center: [1000000, 6600000],
            area: null,
            geometry: []
        },
        title: "test",
        isModified: false,
        kpiList: []
    };

    var saveCurrentProcess = function (credentials) {
        return $http
            .post('/process', currentProcess)
            .then(function (res) {
                var savedProcess = res.data;
                currentProcess.lastSaved = savedProcess.lastSaved;
                setIsModified(false);
                return currentProcess;
            });
    };

    var getCurrentProcess = function() {
        return currentProcess;
    };

    var getIsModified = function() {
        return currentProcess.isModified;
    };

    var setIsModified = function(isModified) {
        currentProcess.isModified = isModified;
    };

    var addKpi = function(kpi) {
        var found = _.find(currentProcess.kpiList, function(item) {
            return kpi.id === item.id;
        });
        if(!found) {
            currentProcess.kpiList.push(kpi);
        }
    };

    return {
        saveCurrentProcess: saveCurrentProcess,
        getCurrentProcess: getCurrentProcess,
        getIsModified: getIsModified,
        setIsModified: setIsModified,
        addKpi: addKpi
    };
}]);