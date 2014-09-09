angular.module('idss-dashboard')

.factory('ContextService', ['$http', function ($http) {

    // from the currentProcess
    // return the context objects needed 
    var getContextFromCurrentProcess = function (currentProcess) {

        // find all objects that require context data
        var requiredContexts = {};

        // a decision process can have required contexts
        _.each(currentProcess.requiredContexts, function(requiredContext) {
            if(!requiredContexts[requiredContext]) {
                requiredContexts[requiredContext] = {
                    requiredBy: []
                };
            }
            requiredContexts[requiredContext].requiredBy.push(currentProcess.title);
        });

        // a kpi can have required contexts
        _.each(currentProcess.kpiList, function(kpi) {
            _.each(kpi.requiredContexts, function(requiredContext) {
                if(!requiredContexts[requiredContext]) {
                    requiredContexts[requiredContext] = {
                        requiredBy: []
                    };
                }
                requiredContexts[requiredContext].requiredBy.push(kpi.name);
            });
        });

        // a module can have required context??

        return getContextsFromIdArray(_.keys(requiredContexts)).then(function(contexts) {

            _.each(contexts, function(context) {
                if(requiredContexts[context.id]) {
                    requiredContexts[context.id].name = context.name;
                    requiredContexts[context.id].inputs = context.inputs; 
                }
            });

            return requiredContexts;
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
        getContextFromCurrentProcess: getContextFromCurrentProcess
    };
}]);