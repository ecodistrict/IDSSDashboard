angular.module('idss-dashboard')

.factory('ModuleService', ['$http', 'NotificationService','ProcessService', '$q', function ($http, NotificationService, ProcessService, $q) {

    var modules = []; // this holds all modules from a getModules request

    var moduleOutputs = {}; // this is a cache for module outputs
    /* stores objects like this 
    {
        variantId: variant_.id,
        moduleId: kpi.selectedModule.moduleId,
        kpi: kpi.alias,
        outputs: the correct output from variant.outputData
    }
    */

    var getModulesFromKpiId = function (kpiId) {
        
        var foundList = _.filter(modules, function(module) {
            return _.find(module.kpiList, function(kpi) {
              return kpi === kpiId;
            });
        }); 

        return foundList;
    };

    var getAllModules = function() {
        
        return modules;
    };

    var addModule = function(module) {
        var found = _.find(modules, function(m) {
            return m.moduleId === module.moduleId;
        });
        if(found) {
            console.log('the module with id ' + module.moduleId + ' already is loaded in dashboard');
        } else {
            modules.push(module);
        }
    };

    var extendModuleData = function(module, basic) {
        var found = _.find(modules, function(m) {
            return m.id === module.moduleId;
        });
        if(found) {
            if(basic) { // only selected module data
                module.name = found.name;
                module.description = found.description;
            } else {
                _.extend(module, found); // extend with all module data
            }
            return module;
        } else {
            return null;
        }
    };

    var getModuleInput = function(variantId, moduleId, kpiId, asIsVariantId) {

        return $http
            .get('variants/moduleinput/' + variantId + '/' + moduleId + '/' + kpiId + '/' + asIsVariantId)
            .error(function(data, status) {
                var label = 'Error when loading inputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var module = res.data;
                return module;
            });
    };

    // moduleObject must contain moduleId, kpiId and inputs
    var saveModuleInput = function(variantId, moduleObject) {

        return $http
            .put('variants/moduleinput/' + variantId, moduleObject)
            .error(function(data, status) {
                var label = 'Error when saving inputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var module = res.data;
                var label = 'Input data was successfully saved';
                NotificationService.createSuccessFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return module;
            });
    };

    var getModuleOutput = function(variantId, moduleId, kpiId) {

        // first check cache
        // TODO: when a new startModule returns a new output to server, let client know to clear the cache
        // var deferred = $q.defer();
        // var cacheKey = variantId + moduleId + kpiId;

        // if(moduleOutputs[cacheKey]) {
        //     deferred.resolve(moduleOutputs[cacheKey]);
        //     return deferred.promise;
        // } else {

            return $http
            .get('variants/moduleoutput/' + variantId + '/' + moduleId + '/' + kpiId)
            .error(function(data, status) {
                var label = 'Error when loading outputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var outputs = res.data;
                return outputs;
                //moduleOutputs[cacheKey] = outputs;
                //return moduleOutputs[cacheKey];
            });

        //}

    };

    var updateModuleOutputStatus = function(variantId, moduleId, kpiId, status, outputs) {

        var moduleOutput = {
            variantId: variantId,
            moduleId: moduleId,
            kpiId: kpiId,
            status: status,
            outputs: outputs
        };

        return $http
            .put('variants/moduleoutput/outputstatus', moduleOutput)
            .error(function(data, status) {
                var label = 'Error when saving inputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var module = res.data;
                var label = 'Data was successfully saved';
                NotificationService.createSuccessFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return module;
            });
    };

    return {
        getModulesFromKpiId: getModulesFromKpiId,
        getAllModules: getAllModules,
        addModule: addModule,
        extendModuleData: extendModuleData,
        getModuleInput: getModuleInput,
        getModuleOutput: getModuleOutput,
        saveModuleInput: saveModuleInput,
        updateModuleOutputStatus: updateModuleOutputStatus
    };
}]);