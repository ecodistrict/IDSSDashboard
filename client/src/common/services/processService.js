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

    // this function is used to set all properties of the process
    // used mostly when fetching a saved process from the server
    // user should always be warned because local data is replaced!
    var updateProcess = function(newProcessData) {
        currentProcess.district = newProcessData.district; // remove reference ATT!
        currentProcess.title = newProcessData.title;
        currentProcess.kpiList = newProcessData.kpiList;
    };

    var loadTestProcess = function() {
        var processFileName = "process_EnergyModuleBuildingFootprintsAdded.json";
        $http
            .get('/static/' + processFileName)
            .then(function (res) {
                updateProcess(res.data);
                setIsModified(true); // simulate a change in the process when loading from file
                return currentProcess;
            });

    };

    //loadTestProcess();

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