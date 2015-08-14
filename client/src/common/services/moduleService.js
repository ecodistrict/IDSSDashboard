angular.module('idss-dashboard')

.factory('ModuleService', ['$http', 'NotificationService', '$q', function ($http, NotificationService, $q) {

    var modules = []; // this holds all modules from a getModules request

    var getModule = function(moduleId) {
        var found = _.find(modules, function(module) {
              return module.moduleId === moduleId;
        }); 

        return found;
    };

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

    var getModuleInput = function(variantId, moduleId, kpiId, asIsVariantId) {

        return $http
            .get('kpirecords/' + variantId + '/' + moduleId + '/' + kpiId + '/' + asIsVariantId)
            .error(function(data, status) {
                var label = 'Error when loading inputs';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var module = res.data;
                return module;
            });
    };

    // moduleObject must contain moduleId, kpiId and inputs
    var saveModuleInput = function(moduleObject) {

        return $http
            .put('kpirecords', moduleObject)
            .error(function(data, status) {
                var label = 'Error when saving inputs';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var module = res.data;
                var label = 'Input data was successfully saved';
                NotificationService.createSuccessFlash(label);
                return module;
            });
    };

    var getModuleOutput = function(variantId, moduleId, kpiId) {

        return $http
        .get('moduleoutput/' + variantId + '/' + moduleId + '/' + kpiId)
        .error(function(data, status) {
            var label = 'Error when loading outputs';
            NotificationService.createErrorFlash(label);
        })
        .then(function (res) {
            var outputs = res.data;
            return outputs;
            
        });

    };

    var deleteModuleOutput = function(kpiId) {
        return $http
            .delete('moduleOutput/' + kpiId)
            .error(function(status, data) {
                var label = 'Error when deleting module output';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                console.log(res);
            });  
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
            .put('moduleoutput/outputstatus', moduleOutput)
            .error(function(data, status) {
                var label = 'Error when saving inputs';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var module = res.data;
                var label = 'Data was successfully saved';
                NotificationService.createSuccessFlash(label);
                return module;
            });
    };

    return {
        getModule: getModule,
        getModulesFromKpiId: getModulesFromKpiId,
        getAllModules: getAllModules,
        addModule: addModule,
        getModuleInput: getModuleInput,
        getModuleOutput: getModuleOutput,
        saveModuleInput: saveModuleInput,
        deleteModuleOutput: deleteModuleOutput,
        updateModuleOutputStatus: updateModuleOutputStatus,
    };
}]);