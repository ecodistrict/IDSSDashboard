angular.module('idss-dashboard')

.factory('ProcessService', ['$http', 'NotificationService', function ($http, NotificationService) {

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
        currentProcess._id = newProcessData._id;
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
            .get('processes/active')
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
                NotificationService.createErrorStatus('Error when saving process');
            })
            .then(function (res) {
                var savedProcess = res.data;
                NotificationService.createSuccessStatus('Last saved ' + savedProcess.dateModified);
                currentProcess.dateModified = savedProcess.dateModified; // current reference needs to be reused
                setIsModified(false);
                return currentProcess;
            });
    };

    var createNewProcess = function() {
        return $http
            .post('processes')
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
            return kpi.alias === item.alias;
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
            setIsModified(true);
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

    return {
        saveCurrentProcess: saveCurrentProcess,
        getCurrentProcess: getCurrentProcess,
        loadCurrentProcess: loadCurrentProcess,
        createNewProcess: createNewProcess,
        getIsModified: getIsModified,
        setIsModified: setIsModified,
        updateProcess: updateProcess,
        addKpi: addKpi,
        removeKpi: removeKpi,
        addVariant: addVariant,
        removeVariant: removeVariant,
        addInputsToModule: addInputsToModule,
        addOutputsToModule: addOutputsToModule
    };
}]);