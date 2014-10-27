angular.module('idss-dashboard')

.factory('ProcessService', ['$http', 'NotificationService', '$filter', function ($http, NotificationService, $filter) {

    // this is used while process is loading to avoid errors in GUI
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

    var deleteCurrentProcess = function() {
        return $http
            .delete('processes/' + currentProcess._id)
            .error(function(status, data) {
                var label = 'Error when deleting process';
                NotificationService.createErrorFlash(label);
                addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var process = res.data;
                var label = 'Process ' + process.title + ' was successfully deleted';
                NotificationService.createSuccessFlash(label);
                addLog({
                    label:label
                });
                return process; // TODO: reset process!
            });
    };

    var getCurrentProcess = function() {
        return currentProcess;
    };

    var getIsModified = function() {
        return currentProcess.isModified;
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
        // if the current process last saved date needs to update
        // TODO: move the logging out of process??
        if(log.updateLastSaved) {
            // this is not optimal, sending the process to server just to update last saved date
            // (this is probably because something outside the process was saved but for the user it is the "process" that was saved)
            saveCurrentProcess();
        }
    };

    // the AS IS is also a variant type
    var getAsIsVariant = function() {
        // TODO
    };

    return {
        saveCurrentProcess: saveCurrentProcess,
        getCurrentProcess: getCurrentProcess,
        loadCurrentProcess: loadCurrentProcess,
        createNewProcess: createNewProcess,
        getIsModified: getIsModified,
        updateProcess: updateProcess,
        addLog: addLog,
        addVariant: addVariant,
        removeVariant: removeVariant,
        addInputsToModule: addInputsToModule,
        addOutputsToModule: addOutputsToModule,
        getAsIsVariant: getAsIsVariant,
        deleteCurrentProcess: deleteCurrentProcess
    };
}]);