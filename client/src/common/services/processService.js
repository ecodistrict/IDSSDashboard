angular.module('idss-dashboard')

.factory('ProcessService', ['$http', function ($http) {

    var currentProcess = {
        district: {
            properties: {
                center: null,
                zoom: null
            },
            area: null,
            geometry: []
        },
        title: null,
        isModified: false,
        requiredContextVariables: ['context1'],
        contextList: [],
        kpiList: []
    };

    // this function is used to set all properties of the process
    // used mostly when fetching a saved process from the server
    // user should always be warned because local data is replaced!
    var updateProcess = function(newProcessData) {
        currentProcess.district = newProcessData.district; // remove reference ATT!
        currentProcess.title = newProcessData.title;
        currentProcess.kpiList = newProcessData.kpiList;
        currentProcess.contextList = newProcessData.contextList;
        currentProcess.description = newProcessData.description;
        currentProcess.requiredContextVariables = newProcessData.requiredContextVariables;
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

    var loadCurrentProcess = function() {
        return $http
            .get('/process')
            .then(function (res) {
                var process = res.data;
                if(process) {
                    updateProcess(res.data);
                }
                return currentProcess;
            });

    };

    //loadTestProcess();

    var saveCurrentProcess = function () {
        return $http
            .post('/process', currentProcess)
            .then(function (res) {
                var savedProcess = res.data;
                currentProcess.lastSaved = savedProcess.lastSaved;
                setIsModified(false);
                return currentProcess;
            });
    };

    var createNewProcess = function() {
        return $http
            .put('/process')
            .then(function (res) {
                var process = res.data;
                if(process) {
                    updateProcess(res.data);
                }
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
        // only add if not already exists
        var found = _.find(currentProcess.kpiList, function(item) {
            return kpi.id === item.id;
        });
        if(!found) {
            currentProcess.kpiList.push(kpi);
            setIsModified(true);
        }
    };

    var removeKpi = function(kpi) {
        var index = _.indexOf(currentProcess.kpiList, kpi);
        if(index) {
            currentProcess.kpiList.splice(index, 1);
            setIsModified(true);
        }
    };

    return {
        saveCurrentProcess: saveCurrentProcess,
        getCurrentProcess: getCurrentProcess,
        loadCurrentProcess: loadCurrentProcess,
        createNewProcess: createNewProcess,
        getIsModified: getIsModified,
        setIsModified: setIsModified,
        updateProcess: updateProcess,
        addKpi: addKpi,
        removeKpi: removeKpi
    };
}]);