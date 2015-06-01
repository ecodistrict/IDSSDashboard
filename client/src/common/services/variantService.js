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
        }
    };

    var updateKpi = function(variant, kpiToUpdate) {
        var kpi = _.find(variant.kpiList, function(k) {
            return k.alias === kpiToUpdate.alias;
        });
        // these are the kpi settings changes 
        kpi.settings = kpiToUpdate.settings;
        kpi.inputSpecification = kpiToUpdate.inputSpecification;
        kpi.manual = kpiToUpdate.manual;
        console.log(kpi);
        // if the selected module is changed delete all module data in variant?
        // now the inputs and outputs are still saved until user remove KPI form list of used kpis (removeKPI below)
        // TODO: NOTIFY USER!!! 
        console.log('update kpi');
        // qualitative kpi changes from as-is, to-be and alternatives dont have selected module, only inputSpecification and settings should be updated
        if(kpiToUpdate.selectedModule) {
            if(kpi.selectedModule.id !== kpiToUpdate.selectedModule.id) {
                console.log('update selected module');
                // clear the previous selected module and set the new id
                kpi.selectedModule = kpiToUpdate.selectedModule;
                // extend new module with data from module list by id
                ModuleService.extendModuleData(kpi.selectedModule, true);
                // send request for getting inputs from module and save that in dashboard database
                kpi.variantId = variant._id;
                socket.emit('selectModule', kpi);
            } else if(!kpi.selectedModule.id) {
                // selected module was removed
                kpi.selectedModule = {
                    id: null
                };
            }
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

    var addOrRemoveKpis = function(asIsVariant, otherVariant) {
        // KPIs are added or removed
        _.each(asIsVariant.kpiList, function(asIsKpi) {
            var found = _.find(otherVariant.kpiList, function(toBeKpi) {return asIsKpi.alias === toBeKpi.alias;});
            var newKpi;
            if(found) {
                found.keep = true;
            } else {
                // add the new kpi that was not added to this variant
                newKpi = angular.copy(asIsKpi);
                newKpi.keep = true;
                if(otherVariant.type === 'to-be') {
                    // to be requires another kind of input
                    KpiService.generateToBeInput(asIsKpi, newKpi);
                }
                otherVariant.kpiList.push(newKpi);
            }
        });
        // remove kpis that has been removed in as is
        for(var i = otherVariant.kpiList.length-1; i >= 0; i--) {
            if(!otherVariant.kpiList[i].keep) {
                otherVariant.kpiList.splice(1, i);
            }
        }
    };

    var addOrRemoveVariants = function(facilitatorVariants, stakeholderVariants) {
        // Variants are added or removed
        _.each(facilitatorVariants, function(fVariant) {
            console.log('facilitator has variant: ');
            console.log(fVariant);
            var sVariant = _.find(stakeholderVariants, function(sVariant) {return sVariant.connectedVariantId === fVariant._id;});
            var newVariant;
            if(sVariant) {
                console.log('that was found in stakeholderVariants');
                sVariant.keep = true;
                // if name or description has been changed
                sVariant.name = fVariant.name;
                sVariant.description = fVariant.description;
                addOrRemoveKpis(fVariant, sVariant);
                saveVariant(sVariant);
            } else {
                console.log('that was NOT found in stakeholderVariants');
                newVariant = angular.copy(fVariant);
                newVariant.keep = true;
                delete newVariant._id;
                newVariant.connectedVariantId = fVariant._id;
                stakeholderVariants.push(newVariant);
                createVariant(newVariant);
            }
        });
        // remove variants that has been removed from facilitator
        for(var i = stakeholderVariants.length-1; i >= 0; i--) {
            console.log('this is a stakeholder variant: ', stakeholderVariants[i]);
            if(stakeholderVariants[i] && !stakeholderVariants[i].keep) {
                console.log('stakeholder variant that was not found in facilitator variant, and should be removed:');
                console.log(stakeholderVariants[i]);
                deleteVariant(stakeholderVariants[i]);
                //stakeholderVariants.splice(1, i);
            }
        }
    };

    return {
        loadVariants: loadVariants,
        loadVariant: loadVariant,
        createVariant: createVariant,
        getVariants: getVariants,
        loadVariantsByProcessId: loadVariantsByProcessId,
        deleteVariant: deleteVariant,
        saveVariant: saveVariant,
        addKpi: addKpi,
        updateKpi: updateKpi,
        removeKpi: removeKpi,
        addOrRemoveKpis: addOrRemoveKpis,
        addOrRemoveVariants: addOrRemoveVariants
    };
}]);