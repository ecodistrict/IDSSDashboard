angular.module('idss-dashboard')

.factory('VariantService', ['$http', 'NotificationService', 'ProcessService', 'ModuleService', function ($http, NotificationService, ProcessService, ModuleService) {

    var variants = [];

    var getVariants = function() {
        if(variants.length === 0) {
            return false;
        } else {
            return variants;
        }
    };

    var loadVariants = function () {
          console.log('length work');

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
                var label = 'Variant ' + variant.title + ' was successfully created';
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
                console.log(asIsVariant);
                return saveVariant(asIsVariant);
            } else {
                label = 'KPI is already added';
                NotificationService.createInfoFlash(label);
            }
        } else {
            label = 'Error: As Is was not loaded properly';
            NotificationService.createErrorFlash(label);
            ProcessService.addLog({
                err: err, 
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
        kpi.inputs = kpiToUpdate.inputs;
        // if the selected module is changed delete all module data in variant
        // TODO: NOTIFY USER!!! 
        if(kpi.selectedModule.id !== kpiToUpdate.selectedModule.id) {
            kpi.selectedModule = kpiToUpdate.selectedModule;
            ModuleService.extendModuleData(kpi.selectedModule);
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
            return saveVariant(asIsVariant);
        }
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