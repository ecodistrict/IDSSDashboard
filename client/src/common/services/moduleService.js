angular.module('idss-dashboard')

.factory('ModuleService', ['$http', 'NotificationService','ProcessService', function ($http, NotificationService, ProcessService) {

    var modules = [];

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
        modules.push(module);
    };

    var extendModuleData = function(module, basic) {
        var found = _.find(modules, function(m) {
            return m._id === module._id;
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

    var getModuleInput = function(variantId, moduleId) {
        return $http
            .get('variants/moduleinput/' + variantId + '/' + moduleId)
            .error(function(status, data) {
                var label = 'Error when loading inputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var module = res.data;
                return module;
            });
    };

    var saveModuleInput = function(variantId, moduleObject) {

        return $http
            .put('variants/moduleinput/' + variantId, moduleObject)
            .error(function(status, data) {
                var label = 'Error when saving inputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
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

    var getModuleOutput = function(variantId, moduleId) {
        return $http
            .get('variants/moduleout/' + variantId + '/' + moduleId)
            .error(function(status, data) {
                var label = 'Error when loading outputs';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var module = res.data;
                return module;
            });
    };

    return {
        getModulesFromKpiId: getModulesFromKpiId,
        getAllModules: getAllModules,
        addModule: addModule,
        extendModuleData: extendModuleData,
        getModuleInput: getModuleInput,
        saveModuleInput: saveModuleInput
    };
}]);