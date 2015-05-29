angular.module('idss-dashboard')

.factory('ProcessService', ['$http', 'NotificationService', '$filter', '$q', 'KpiService', 'ModuleService', 'socket', function ($http, NotificationService, $filter, $q, KpiService, ModuleService, socket) {

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
        currentProcess.kpiList = newProcessData.kpiList || [];
        currentProcess.description = newProcessData.description;
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

    var addKpi = function(kpiToAdd) {
        var label;
        // only allow removing KPI on as-is variant
        var alreadyAdded = _.find(currentProcess.kpiList, function(k) {return k.alias === kpiToAdd.alias;});
        
        if(!alreadyAdded) {
            // add properties for instantiated kpi on variant
            kpiToAdd.selectedModule = {id: null};
            if(kpiToAdd.qualitative) {
                kpiToAdd.qualitativeSettings = KpiService.generateQualitativeKpiSettings();
                kpiToAdd.bad = 1;
                kpiToAdd.excellent = 10;
            } 
            currentProcess.kpiList.unshift(kpiToAdd);
            return saveCurrentProcess();
        } else {
            label = 'KPI is already added';
            NotificationService.createInfoFlash(label);
            var deferred = $q.defer();
            deferred.resolve(false);
            return deferred.promise;
        }
    };

    var updateKpiSettings = function(kpiToUpdate) {
        var kpi = _.find(currentProcess.kpiList, function(k) {
            return k.alias === kpiToUpdate.alias;
        });
        // these are the kpi settings changes 
        kpi.bad = kpiToUpdate.bad;
        kpi.excellent = kpiToUpdate.excellent;
        kpi.qualitativeSettings = kpiToUpdate.qualitativeSettings;
        // if the selected module is changed delete all module data in variant?
        // now the inputs and outputs are still saved until user remove KPI form list of used kpis (removeKPI below)
        // TODO: NOTIFY USER!!! 
        console.log('update kpi');
        if(kpiToUpdate.selectedModule.id) {
            // set the selected module
            kpi.selectedModule = kpiToUpdate.selectedModule;
            // extend new module with data from module list by id
            ModuleService.extendModuleData(kpi.selectedModule, true);
            // send request for getting inputs from module and save that in dashboard database
            kpi.processId = currentProcess._id;
            socket.emit('selectModule', kpi);
        } else {
            // selected module was removed or didn't exist
            kpi.selectedModule = {
                id: null,
                name: null,
                description: null
            };
        }
        saveCurrentProcess().then(function() {
            return currentProcess;
        });
    };

    var removeKpi = function(kpiToRemove) {
        
        var kpi = _.find(currentProcess.kpiList, function(k) {
            return k.alias === kpiToRemove.alias;
        });
        if(kpi) {
            var index = _.indexOf(currentProcess.kpiList, kpi);
            currentProcess.kpiList.splice(index, 1);
            return saveCurrentProcess();
        }
    };


    return {
        updateProcess: updateProcess,
        loadCurrentProcess: loadCurrentProcess,
        saveCurrentProcess: saveCurrentProcess,
        createNewProcess: createNewProcess,
        deleteCurrentProcess: deleteCurrentProcess,
        getCurrentProcess: getCurrentProcess,
        addKpi: addKpi,
        updateKpiSettings: updateKpiSettings,
        removeKpi: removeKpi
    };
}]);