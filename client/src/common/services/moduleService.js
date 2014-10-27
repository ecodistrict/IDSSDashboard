angular.module('idss-dashboard')

.factory('ModuleService', ['$http', function ($http) {

    var modules = [];

    var getModulesFromKpiId = function (kpiId) {
        
        var foundList = _.filter(modules, function(module) {
            return _.find(module.useKpis, function(kpi) {
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

    return {
        getModulesFromKpiId: getModulesFromKpiId,
        getAllModules: getAllModules,
        addModule: addModule,
        extendModuleData: extendModuleData
    };
}]);