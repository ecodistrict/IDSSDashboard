angular.module('idss-dashboard')

.factory('VariantService', ['$http', 'NotificationService', 'ProcessService', 'ModuleService', 'socket', function ($http, NotificationService, ProcessService, ModuleService, socket) {

    var variants = [];

    var getVariants = function() {
        if(variants.length === 0) {
            return false;
        } else {
            return variants;
        }
    };

    var loadVariants = function () {
        return $http
            .get('variants')
            .error(function(status, data) {
                var label = 'Error when loading variants';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                variants = res.data;
                return variants;
            });
    };

    var createVariant = function(variantToCreate) {
        return $http
            .post('variants', variantToCreate)
            .error(function(status, data) {
                var label = 'Error when creating variant';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var variant = res.data;
                var label = 'Variant ' + variant.name + ' was successfully created';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return variant;
            });
    };

    var saveVariant = function (variant) {
        return $http
            .put('variants', variant)
            .error(function(status, err) {
                var label = 'Error when saving variant';
                NotificationService.createErrorStatus(label);
                ProcessService.addLog({
                    label: label,
                    err: err,
                    status: status
                });
            })
            .then(function (res) {
                var savedVariant = res.data;
                var label = 'Variant was saved';
                // NotificationService.createSuccessStatus(label);
                ProcessService.addLog({
                    label: label,
                    updateLastSaved: true
                });
                return savedVariant;
            });
    };

    var deleteVariant = function(variantToDelete) {
        return $http
            .delete('variants/' + variantToDelete._id)
            .error(function(status, data) {
                var label = 'Error when deleting variant';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: err, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                var variant = res.data;
                var label = 'Variant ' + variant.name + ' was successfully deleted';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    label:label
                });
                return variant;
            });
    };

    var addKpi = function(kpiToAdd) {
        var label;
        // only allow removing KPI on as-is variant
        var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
        if(asIsVariant) {
            // only add if not already exists
            var found = _.find(asIsVariant.kpiList, function(item) {
                return kpiToAdd.alias === item.alias;
            });
            if(!found) {
                // add properties for instantiated kpi on variant
                kpiToAdd.selectedModule = {id: null};
                asIsVariant.kpiList.push(kpiToAdd);
                return saveVariant(asIsVariant);
            } else {
                label = 'KPI is already added';
                NotificationService.createInfoFlash(label);
            }
        } else {
            label = 'Error: As Is was not loaded properly';
            NotificationService.createErrorFlash(label);
            ProcessService.addLog({
                label:label,
                status: status
            });
        }
    };

    var updateKpi = function(variant, kpiToUpdate) {
        var kpi = _.find(variant.kpiList, function(k) {
            return k.alias === kpiToUpdate.alias;
        });
        // these are the kpi settings changes 
        kpi.inputSpecification = kpiToUpdate.inputSpecification;
        console.log(kpi);
        // if the selected module is changed delete all module data in variant
        // TODO: NOTIFY USER!!! 
        console.log('update kpi');
        if(kpi.selectedModule.id !== kpiToUpdate.selectedModule.id) {
            console.log('update selected module');
            // clear the previous selected module and set the new id
            kpi.selectedModule = kpiToUpdate.selectedModule;
            // extend new module with data from module list by id
            ModuleService.extendModuleData(kpi.selectedModule, true);
            // send request for getting inputs from module and save that in dashboard database
            kpi.variantId = variant._id;
            socket.emit('selectModel', kpi);
        }
        saveVariant(variant).then(function(savedVariant) {
            return savedVariant;
        });
    };

    var removeKpi = function(kpi) {
        // only allow removing KPI on as-is variant
        var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
        var found = _.find(asIsVariant.kpiList, function(k) {
            return k.alias === kpi.alias;
        });
        if(found) {
            var index = _.indexOf(asIsVariant.kpiList, found);
            asIsVariant.kpiList.splice(index, 1);
            // kpi was removed, clean all stored input and output
            return removeInputData(asIsVariant._id, found.alias).then(function() {
                return removeOutputData(asIsVariant._id, found.alias).then(function() {
                    console.log('input and output was removed');
                    return saveVariant(asIsVariant);
                });
            });
        }
    };

    var removeInputData = function(variantId, kpiId) {
        return $http
            .delete('variants/moduleInput/' + variantId + '/' + kpiId)
            .error(function(status, data) {
                var label = 'Error when deleting module input';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                console.log(res);
            });  
    };

    var removeOutputData = function(variantId, kpiId) {
        return $http
            .delete('variants/moduleOutput/' + variantId + '/' + kpiId)
            .error(function(status, data) {
                var label = 'Error when deleting module output';
                NotificationService.createErrorFlash(label);
                ProcessService.addLog({
                    err: data, 
                    label:label,
                    status: status
                });
            })
            .then(function (res) {
                console.log(res);
            });  
    };

    return {
        loadVariants: loadVariants,
        createVariant: createVariant,
        getVariants: getVariants,
        deleteVariant: deleteVariant,
        addKpi: addKpi,
        updateKpi: updateKpi,
        removeKpi: removeKpi
    };
}]);