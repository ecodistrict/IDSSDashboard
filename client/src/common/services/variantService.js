angular.module('idss-dashboard')

.factory('VariantService', ['$http', 'NotificationService', 'ProcessService', 'ModuleService', 'socket', 'KpiService', function ($http, NotificationService, ProcessService, ModuleService, socket, KpiService) {

    var variants = [];
    // variants are bootstrapped
    var loader = $http
            .get('variants')
            .error(function(status, data) {
                var label = 'Error when loading variants';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                variants = res.data;
                return variants;
            });

    var getVariants = function() {
        if(variants.length === 0) {
            return false;
        } else {
            return variants;
        }
    };

    var loadVariants = function () {
        return loader;
    };

    var loadVariant = function (variantId) {
        return $http
            .get('variants/' + variantId)
            .error(function(status, data) {
                var label = 'Error when loading variants';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                variants = res.data;
                return variants;
            });
    };

    var loadVariantsByProcessId = function () {
        return $http
            .get('variants/processid')
            .error(function(status, data) {
                var label = 'Error when loading variants';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                variantData = res.data;
                return variantData;
            });
    };

    var createVariant = function(variantToCreate) {
        return $http
            .post('variants', variantToCreate)
            .error(function(status, data) {
                var label = 'Error when creating variant';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var variant = res.data;
                var label = 'Variant ' + variant.name + ' was successfully created';
                NotificationService.createSuccessFlash(label);
                variants.push(variant);
                return variant;
            });
    };

    var saveVariant = function (variant) {
        return $http
            .put('variants', variant)
            .error(function(status, err) {
                var label = 'Error when saving variant';
                NotificationService.createErrorStatus(label);
            })
            .then(function (res) {
                var savedVariant = res.data;
                var label = 'Variant was saved';
                // NotificationService.createSuccessStatus(label);
                return savedVariant;
            });
    };

    // kpi values stored on variants
    var addKpiValue = function(variant, kpiId, kpiValue) {
        variant.kpiValues = variant.kpiValues || {};
        variant.kpiValues[kpiId] = kpiValue;
        return saveVariant(variant).then(function(v) {
            NotificationService.createSuccessFlash('KPI value was added');
            return v;
        });
    };   

    // kpi disabled for the variant
    var toggleDisabled = function(variant, kpi) {
        variant.kpiDisabled = variant.kpiDisabled || {}; // should not be needed..
        if(variant.kpiDisabled[kpi.kpiAlias]) {
            variant.kpiDisabled[kpi.kpiAlias] = false;
        } else {
            variant.kpiDisabled[kpi.kpiAlias] = true;
        }
        return saveVariant(variant).then(function(c) {
            NotificationService.createSuccessFlash('KPI settings changed');
        });
    };

    var deleteVariant = function(variantToDelete) {
        return $http
            .delete('variants/' + variantToDelete._id)
            .error(function(status, data) {
                var label = 'Error when deleting variant';
                NotificationService.createErrorFlash(label);
            })
            .then(function (res) {
                var variant = res.data;
                var label = 'Variant ' + variant.name + ' was successfully deleted';
                NotificationService.createSuccessFlash(label);
                return variant;
            });
    };

    // var addOrRemoveKpis = function(asIsVariant, otherVariant) {
    //     // KPIs are added or removed
    //     _.each(asIsVariant.kpiList, function(asIsKpi) {
    //         var found = _.find(otherVariant.kpiList, function(toBeKpi) {return asIsKpi.kpiAlias === toBeKpi.kpiAlias;});
    //         var newKpi;
    //         if(found) {
    //             found.keep = true;
    //         } else {
    //             // add the new kpi that was not added to this variant
    //             newKpi = angular.copy(asIsKpi);
    //             newKpi.keep = true;
    //             if(otherVariant.type === 'to-be') {
    //                 // to be requires another kind of input
    //                 KpiService.generateToBeInput(asIsKpi, newKpi);
    //             }
    //             otherVariant.kpiList.push(newKpi);
    //         }
    //     });
    //     // remove kpis that has been removed in as is
    //     for(var i = otherVariant.kpiList.length-1; i >= 0; i--) {
    //         if(!otherVariant.kpiList[i].keep) {
    //             otherVariant.kpiList.splice(1, i);
    //         }
    //     }
    // };

    // var addOrRemoveVariants = function(facilitatorVariants, stakeholderVariants) {
    //     // Variants are added or removed
    //     _.each(facilitatorVariants, function(fVariant) {
    //         console.log('facilitator has variant: ');
    //         console.log(fVariant);
    //         var sVariant = _.find(stakeholderVariants, function(sVariant) {return sVariant.connectedVariantId === fVariant._id;});
    //         var newVariant;
    //         if(sVariant) {
    //             console.log('that was found in stakeholderVariants');
    //             sVariant.keep = true;
    //             // if name or description has been changed
    //             sVariant.name = fVariant.name;
    //             sVariant.description = fVariant.description;
    //             addOrRemoveKpis(fVariant, sVariant);
    //             saveVariant(sVariant);
    //         } else {
    //             console.log('that was NOT found in stakeholderVariants');
    //             newVariant = angular.copy(fVariant);
    //             newVariant.keep = true;
    //             delete newVariant._id;
    //             newVariant.connectedVariantId = fVariant._id;
    //             stakeholderVariants.push(newVariant);
    //             createVariant(newVariant);
    //         }
    //     });
    //     // remove variants that has been removed from facilitator
    //     for(var i = stakeholderVariants.length-1; i >= 0; i--) {
    //         console.log('this is a stakeholder variant: ', stakeholderVariants[i]);
    //         if(stakeholderVariants[i] && !stakeholderVariants[i].keep) {
    //             console.log('stakeholder variant that was not found in facilitator variant, and should be removed:');
    //             console.log(stakeholderVariants[i]);
    //             deleteVariant(stakeholderVariants[i]);
    //             //stakeholderVariants.splice(1, i);
    //         }
    //     }
    // };

    return {
        loadVariants: loadVariants,
        loadVariant: loadVariant,
        createVariant: createVariant,
        getVariants: getVariants,
        loadVariantsByProcessId: loadVariantsByProcessId,
        deleteVariant: deleteVariant,
        saveVariant: saveVariant,
        addKpiValue: addKpiValue,
        toggleDisabled: toggleDisabled
        //addOrRemoveKpis: addOrRemoveKpis,
        //addOrRemoveVariants: addOrRemoveVariants
    };
}]);