angular.module('idss-dashboard')

.factory('ProcessService', ['$http', 'NotificationService', '$filter', '$q', 'KpiService', 'ModuleService', 'socket', function ($http, NotificationService, $filter, $q, KpiService, ModuleService, socket) {

    // this is used while process is loading to avoid errors in GUI
    var currentProcess = {
        district: {},
        title: null,
        kpiList: []
    };

    // current process is bootstrapped
    var loader = $http
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
        var deferred;
        if(currentProcess._id) {
            deferred = $q.defer();
            deferred.resolve(currentProcess);
            return deferred.promise;
        } else {
            return loader;
        }
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
                currentProcess = {
                    district: {},
                    title: null,
                    kpiList: []
                };
                return process; // TODO: reset process!
            });
    };

    var getCurrentProcess = function() {
        return currentProcess;
    };

    var addKpi = function(kpiToAdd) {
        var label;
        var alreadyAdded = _.find(currentProcess.kpiList, function(k) {return k.kpiAlias === kpiToAdd.alias;});
        if(!alreadyAdded) {
            // add properties for instantiated kpi on process
            kpiToAdd.kpiAlias = kpiToAdd.alias;
            kpiToAdd.selectedModule = {id: null};
            if(kpiToAdd.qualitative) {
                kpiToAdd.qualitativeSettings = KpiService.generateQualitativeKpiSettings();
                kpiToAdd.sufficient = 6;
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

    var updateKpiSettings = function(newKpiData) {
        var kpi = _.find(currentProcess.kpiList, function(k) {
            return k.kpiAlias === newKpiData.kpiAlias;
        });
        // these are the kpi settings changes 
        if(newKpiData.sufficient || newKpiData.sufficient === 0) {
            kpi.sufficient = newKpiData.sufficient;
        }
        if(newKpiData.descriptionSufficient || newKpiData.descriptionSufficient === '') {
            kpi.descriptionSufficient = newKpiData.descriptionSufficient;
        }
        if(newKpiData.excellent || newKpiData.excellent === 0) {
            kpi.excellent = newKpiData.excellent;
        }
        if(newKpiData.descriptionExcellent || newKpiData.descriptionExcellent === '') {
            kpi.descriptionExcellent = newKpiData.descriptionExcellent;
        }
        if(newKpiData.qualitativeSettings) {
            kpi.qualitativeSettings = newKpiData.qualitativeSettings;
        }
        // TODO: if selected module is removed or changed, how to do with existing kpi records?
        if(newKpiData.selectedModuleId) {
            // set the selected module
            kpi.selectedModuleId = newKpiData.selectedModuleId;
            // send request for getting inputs from module and save that in dashboard database
            kpi.processId = currentProcess._id;
            socket.emit('selectModule', kpi);
        } else {
            kpi.selectedModuleId = null;
        }
        
        saveCurrentProcess().then(function() {
            return currentProcess;
        });
    };

    var removeKpi = function(kpiToRemove) {
        
        var kpi = _.find(currentProcess.kpiList, function(k) {
            return k.kpiAlias === kpiToRemove.kpiAlias;
        });
        if(kpi) {
            var index = _.indexOf(currentProcess.kpiList, kpi);
            currentProcess.kpiList.splice(index, 1);
            KpiService.deleteKpiRecords(kpi);
            return saveCurrentProcess();
        }
    };

    var addModuleInputSpecification = function(moduleData) {
        var kpi = _.find(currentProcess.kpiList, function(k) {
            return k.kpiAlias === moduleData.kpiId; // form module; it is called kpiId
        });
        if(kpi && moduleData.inputSpecification) {
            kpi.inputSpecification = moduleData.inputSpecification;
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
        removeKpi: removeKpi,
        addModuleInputSpecification: addModuleInputSpecification
    };
}]);