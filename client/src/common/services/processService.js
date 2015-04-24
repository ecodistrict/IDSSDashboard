angular.module('idss-dashboard')

.factory('ProcessService', ['$http', 'NotificationService', '$filter', function ($http, NotificationService, $filter) {

    // this is used while process is loading to avoid errors in GUI
    var currentProcess = {
        district: {},
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
            })
            .then(function (res) {
                var savedProcess = res.data;
                var label = 'Process was saved';
                NotificationService.createSuccessStatus(label);
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
            })
            .then(function (res) {
                var process = res.data;
                var label = 'Process was created';
                NotificationService.createSuccessStatus(label);
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
            })
            .then(function (res) {
                var process = res.data;
                var label = 'Process ' + process.title + ' was successfully deleted';
                NotificationService.createSuccessFlash(label);
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
        addVariant: addVariant,
        removeVariant: removeVariant,
        getAsIsVariant: getAsIsVariant,
        deleteCurrentProcess: deleteCurrentProcess
    };
}]);