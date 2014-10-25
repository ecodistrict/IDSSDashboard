angular.module('idss-dashboard')

.factory('ProcessService', ['$http', 'NotificationService', '$filter', function ($http, NotificationService, $filter) {

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
        contextList: [],
        kpiList: [],
        logs: []
    };

    // this function is used to set all properties of the process
    // used mostly when fetching a saved process from the server
    // user should always be warned because local data is replaced!
    var updateProcess = function(newProcessData) {
        currentProcess._id = newProcessData._id;
        currentProcess.dateModified = newProcessData.dateModified;
        currentProcess.district = newProcessData.district; // remove reference ATT!
        currentProcess.title = newProcessData.title;
        currentProcess.kpiList = newProcessData.kpiList;
        currentProcess.contextList = newProcessData.contextList;
        currentProcess.description = newProcessData.description;
        currentProcess.logs = newProcessData.logs;
    };

    var loadCurrentProcess = function() {
        return $http
            .get('processes/active')
            .error(function(status, err) {
                var label = 'Error when loading active process';
                NotificationService.createErrorStatus(label);
                addLog({
                    label: label,
                    err: err,
                    status: status
                });
            })
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
            .put('processes', currentProcess)
            .error(function(status, err) {
                var label = 'Error when saving process';
                NotificationService.createErrorStatus(label);
                addLog({
                    label: label,
                    err: err,
                    status: status
                });
            })
            .then(function (res) {
                var savedProcess = res.data;
                var label = 'Process was saved';
                NotificationService.createSuccessStatus(label);
                addLog({
                    label: label
                });
                currentProcess.dateModified = savedProcess.dateModified; // current reference needs to be reused
                return currentProcess;
            });
    };

    var createNewProcess = function() {
        return $http
            .post('processes')
            .error(function(status, err) {
                var label = 'Error when creating process';
                NotificationService.createErrorStatus(label);
                addLog({
                    label: label,
                    err: err,
                    status: status
                });
            })
            .then(function (res) {
                var process = res.data;
                var label = 'Process was created';
                NotificationService.createSuccessStatus(label);
                addLog({
                    label: label
                });
                updateProcess(process);
                return currentProcess;
            });
    };

    var getCurrentProcess = function() {
        return currentProcess;
    };

    var getIsModified = function() {
        return currentProcess.isModified;
    };

    var addKpi = function(kpi) {
        // only add if not already exists
        var found = _.find(currentProcess.kpiList, function(item) {
            return kpi.alias === item.alias;
        });
        if(!found) {
            currentProcess.kpiList.push(kpi);
            return saveCurrentProcess();
        }
    };

    var removeKpi = function(kpi) {
        var index = _.indexOf(currentProcess.kpiList, kpi);
        if(index !== -1) {
            currentProcess.kpiList.splice(index, 1);
            return saveCurrentProcess();
        }
    };

    var addVariant = function(alternative, context) {
        currentProcess.variants = currentProcess.variants || [];
        currentProcess.variants.push({
            alternative: alternative,
            context: context
        });
    };

    var removeVariant = function(variant) {
        var index = _.indexOf(currentProcess.variants, variant);
        if(index) {
            currentProcess.variants.splice(index, 1);
        }
    };

    var addInputsToModule = function(module) {
        _.each(currentProcess.kpiList, function(kpi) {
            if(kpi.selectedModule.id === module.id) {
                kpi.selectedModule.inputs = module.inputs;
            }
        }); 
    };

    var addOutputsToModule = function(module) {
        console.log(module);
        _.each(currentProcess.kpiList, function(kpi) {
            if(kpi.selectedModule.id === module.id) {
                kpi.selectedModule.outputs = module.outputs;
                kpi.selectedModule.isProcessing = false;
            }
        }); 
    };

    var addLog = function(log) {
        log.date = Date.now();
        if(currentProcess.logs.length === 10) {
            currentProcess.shift(currentProcess.logs);
        }
        currentProcess.logs.push(log);
        console.log(currentProcess);
    };

    return {
        saveCurrentProcess: saveCurrentProcess,
        getCurrentProcess: getCurrentProcess,
        loadCurrentProcess: loadCurrentProcess,
        createNewProcess: createNewProcess,
        getIsModified: getIsModified,
        updateProcess: updateProcess,
        addKpi: addKpi,
        addLog: addLog,
        removeKpi: removeKpi,
        addVariant: addVariant,
        removeVariant: removeVariant,
        addInputsToModule: addInputsToModule,
        addOutputsToModule: addOutputsToModule
    };
}]);