angular.module('idss-dashboard')

.factory('ContextService', ['$http', function ($http) {

    var markRequiredContextVariables = function(contexts, currentProcess) {
        // find all objects that require context data
        var requiredContextVariables = {};

        // a decision process can have required contexts
        _.each(currentProcess.requiredContextVariables, function(requiredVariable) {
            var currentProcessTitle = currentProcess.title || 'Current process title is missing..';
            if(!requiredContextVariables[requiredVariable]) {
                requiredContextVariables[requiredVariable] = {
                    requiredBy: []
                };
            }
            requiredContextVariables[requiredVariable].requiredBy.push(currentProcessTitle);
        });

        // a kpi can have required contexts
        _.each(currentProcess.kpiList, function(kpi) {
            _.each(kpi.requiredContextVariables, function(requiredVariable) {
                if(!requiredContextVariables[requiredVariable]) {
                    requiredContextVariables[requiredVariable] = {
                        requiredBy: []
                    };
                }
                requiredContextVariables[requiredVariable].requiredBy.push(kpi.name);
            });
        });

        _.each(contexts, function(context) {
            context.requiredBy = requiredContextVariables[context.id] ? requiredContextVariables[context.id].requiredBy : [];
        });

        return contexts;
    };

    var getContextVariables = function(currentProcess) {
        return $http({
          method: 'GET',
          url: '/context'
        }).then(function (res) {
            var contexts = res.data;
            // if currentProcess is given - mark required context variables
            if(currentProcess) {
                markRequiredContextVariables(contexts, currentProcess);
            }
            return contexts;
        });
    };

    var getContextsFromIdArray = function (contextIds) {
        return $http({
          method: 'GET',
          url: '/context/list',
          params: {
            ids: JSON.stringify(contextIds)
          }
        }).then(function (res) {
            return res.data;
        });
    };

    return {
        getContextVariables: getContextVariables
    };
}]);