(function() {
    'use strict';

    function CaseService($http, NotificationService, $q, KpiService, socket) {

        // this is used while process is loading to avoid errors in GUI
        var currentCase = {
            title: null,
            kpiList: []
        };

        // current case is bootstrapped
        var loader = $http
            .get('cases/active')
            .error(function(status, err) {
                var label = 'Error when loading active process';
                NotificationService.createErrorStatus(label);
            })
            .then(function (res) {
                var c = res.data;
                if(c) {
                    updateCase(c);
                }
                return currentCase;
            });

        var updateCase = function(newCaseData) {
            currentCase._id = newCaseData._id;
            currentCase.userId = newCaseData.userId;
            currentCase.dateModified = newCaseData.dateModified;
            currentCase.district = newCaseData.district; // remove reference ATT!
            currentCase.title = newCaseData.title;
            currentCase.kpiList = newCaseData.kpiList || [];
            currentCase.description = newCaseData.description;
        };

        var loadActiveCase = function() {
            var deferred;
            if(currentCase._id) {
                deferred = $q.defer();
                deferred.resolve(currentCase);
                return deferred.promise;
            } else {
                return loader;
            }
        };

        var saveCurrentCase = function () {
            return $http
                .put('cases', currentCase)
                .error(function(status, err) {
                    var label = 'Error when saving process';
                    NotificationService.createErrorStatus(label);
                })
                .then(function (res) {
                    var savedCase = res.data;
                    var label = 'Process was saved';
                    NotificationService.createSuccessStatus(label);
                    currentCase.dateModified = savedCase.dateModified; // current reference needs to be reused
                    return currentCase;
                });
        };

        var createNewCase = function() {
            return $http
                .post('cases')
                .error(function(status, err) {
                    var label = 'Error when creating process';
                    NotificationService.createErrorStatus(label);
                })
                .then(function (res) {
                    var c = res.data;
                    var label = 'Process was created';
                    NotificationService.createSuccessStatus(label);
                    updateCase(c);
                    return currentCase;
                });
        };

        var deleteCase = function(caseItem) {
            return $http
                .delete('cases/' + caseItem._id)
                .error(function(status, data) {
                    var label = 'Error when deleting process';
                    NotificationService.createErrorFlash(label);
                })
                .then(function (res) {
                    var c = res.data;
                    var label = 'Process ' + c.title + ' was successfully deleted';
                    NotificationService.createSuccessFlash(label);
                    // reset current case if that was deleted
                    if(caseItem._id === currentCase._id) {
                        currentCase = {
                            title: null,
                            kpiList: []
                        };
                    }
                    return c; 
                });
        };

        var getActiveCase = function() {
            return currentCase;
        };

        var loadCase = function(caseId) {
            return $http.get('cases/' + caseId)
            .error(function(status, err) {
                var label = 'Error when loading process with ID: ' + caseId;
                NotificationService.createErrorStatus(label);
            }).then(function (res) {
                var c = res.data;
                if(c) {
                    updateCase(c);
                }
                return currentCase;
            });
        };

        var loadCases = function() {
            return $http.get('cases')
            .error(function(status, err) {
                var label = 'Error when loading processes';
                NotificationService.createErrorStatus(label);
            }).then(function (res) {
                return res.data;
            });
        };

        var addKpi = function(kpiToAdd) {
            var label;
            var alreadyAdded = _.find(currentCase.kpiList, function(k) {return k.kpiAlias === kpiToAdd.alias;});
            if(!alreadyAdded) {
                // add properties for instantiated kpi on process
                kpiToAdd.kpiAlias = kpiToAdd.alias;
                kpiToAdd.selectedModule = {id: null};
                if(kpiToAdd.qualitative) {
                    kpiToAdd.qualitativeSettings = KpiService.generateQualitativeKpiSettings();
                    kpiToAdd.sufficient = 6;
                    kpiToAdd.excellent = 10;
                } 
                currentCase.kpiList.unshift(kpiToAdd);
                return saveCurrentCase();
            } else {
                label = 'KPI is already added';
                NotificationService.createInfoFlash(label);
                var deferred = $q.defer();
                deferred.resolve(false);
                return deferred.promise;
            }
        };

        var updateKpiSettings = function(newKpiData) {
            var kpi = _.find(currentCase.kpiList, function(k) {
                return k.kpiAlias === newKpiData.kpiAlias;
            });
            // these are the kpi settings changes 
            if(newKpiData.sufficient || newKpiData.sufficient === 0) {
                kpi.sufficient = newKpiData.sufficient;
            }
            if(newKpiData.descriptionSufficient || newKpiData.descriptionSufficient === '') {
                kpi.descriptionSufficient = newKpiData.descriptionSufficient;
            }
            if(newKpiData.excellent || newKpiData.excellent === 0) {
                kpi.excellent = newKpiData.excellent;
            }
            if(newKpiData.descriptionExcellent || newKpiData.descriptionExcellent === '') {
                kpi.descriptionExcellent = newKpiData.descriptionExcellent;
            }
            if(newKpiData.qualitativeSettings) {
                kpi.qualitativeSettings = newKpiData.qualitativeSettings;
            }
            // TODO: if selected module is removed or changed, how to do with existing kpi data?
            if(newKpiData.selectedModuleId) {
                kpi.selectedModuleId = newKpiData.selectedModuleId;
            } else {
                kpi.selectedModuleId = null;
            }
            
            saveCurrentCase().then(function() {
                return currentCase;
            });
        };

        var removeKpi = function(kpiToRemove) {
            
            var kpi = _.find(currentCase.kpiList, function(k) {
                return k.kpiAlias === kpiToRemove.kpiAlias;
            });
            if(kpi) {
                var index = _.indexOf(currentCase.kpiList, kpi);
                currentCase.kpiList.splice(index, 1);
                // TODO: remove this line?
                // KpiService.deleteKpiRecords(kpi);
                return saveCurrentCase();
            }
        };

        // when changing a KPI in KPI database, the process can be updated for already selected KPIs
        var updateSelectedKpi = function(kpi) {
            _.each(currentCase.kpiList, function(selectedKpi) {
                if(selectedKpi.kpiAlias === kpi.alias) {
                    selectedKpi.name = kpi.name;
                    selectedKpi.description = kpi.description;
                    selectedKpi.qualitative = kpi.qualitative;
                    selectedKpi.official = kpi.official;
                    selectedKpi.unit = kpi.unit;
                }
            });     
            saveCurrentCase(); 
        };

        return {
            updateCase: updateCase,
            loadActiveCase: loadActiveCase,
            saveCurrentCase: saveCurrentCase,
            createNewCase: createNewCase,
            deleteCase: deleteCase,
            getActiveCase: getActiveCase,
            loadCase: loadCase,
            loadCases: loadCases,
            addKpi: addKpi,
            updateKpiSettings: updateKpiSettings,
            removeKpi: removeKpi,
            updateSelectedKpi: updateSelectedKpi
        };
    }

    angular.module('idss-dashboard').factory('CaseService', CaseService);

    CaseService.$inject = ['$http', 'NotificationService', '$q', 'KpiService', 'socket'];

})();