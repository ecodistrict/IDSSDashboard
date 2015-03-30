angular.module( 'idss-dashboard.to-be', [
  'idss-dashboard.to-be.ambitions-kpi'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'to-be', {
    url: '/to-be',
    views: {
      "main": {
        controller: 'ToBeController',
        templateUrl: '04-to-be/to-be.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'To be',
      authorizedRoles: ['Facilitator']
    },
    resolve:{
      variants: ['VariantService', function(VariantService) {
        var v = VariantService.getVariants();
        if(v) {
          return v;
        } else {
          return VariantService.loadVariants();
        }
      }]
    }
  });
}])

.controller( 'ToBeController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'variants', 'ModuleService', 'VariantService', '$modal', 'KpiService', function ToBeController( $scope, $timeout, $sce, socket, $state, variants, ModuleService, VariantService, $modal, KpiService ) {

    var toBeVariant = _.find(variants, function(v) {return v.type === 'to-be';});
    var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

    var initOutputs = function(variant) {
        _.each(variant.kpiList, function(kpi) {
            var asIsKpi = _.find(asIsVariant.kpiList, function(k) { return k.alias === kpi.alias;});
            if(kpi.qualitative) {
                kpi.outputs = KpiService.generateQualitativeKpiOutput(kpi.inputSpecification.kpiScores.inputs);
            } else {
                kpi.outputs = KpiService.generateQuantitativeKpiOutput(kpi.inputSpecification.kpiValueInputGroup.inputs.kpiValue);
            }
            kpi.kpiBad = KpiService.getBadKpiValue(asIsKpi.inputSpecification);
            kpi.kpiExcellent = KpiService.getExcellentKpiValue(asIsKpi.inputSpecification);
            kpi.kpiUnit = kpi.unit || 'score';
        });
        $scope.toBeVariant = variant;
    };

    if(asIsVariant) {
        // if first time - create the to be variant
        if(!toBeVariant) {
            toBeVariant = angular.copy(asIsVariant); // shallow copy
            delete toBeVariant._id;
            toBeVariant.name = 'To be';
            toBeVariant.type = 'to-be';
            toBeVariant.description = "The TO BE state defines the KPI ambitions for a connected user";
            // to be input looks different so it has to be converted
            _.each(toBeVariant.kpiList, function(toBeKpi) {
                var asIsKpi = toBeKpi;
                toBeKpi = angular.copy(asIsKpi);
                KpiService.generateToBeInput(asIsKpi, toBeKpi);
            });
            VariantService.createVariant(toBeVariant).then(function(newVariant) {
                initOutputs(newVariant);
            });
        } else if(asIsVariant.kpiList.length !== toBeVariant.kpiList.length) {
            // KPIs are added or removed
            _.each(asIsVariant.kpiList, function(asIsKpi) {
                var found = _.find(toBeVariant.kpiList, function(toBeKpi) {return asIsKpi.alias === toBeKpi.alias;});
                var toBeKpi;
                if(found) {
                    found.keep = true;
                } else {
                    // add the new kpi that was not added to this variant
                    toBeKpi = angular.copy(asIsKpi);
                    toBeKpi.keep = true;
                    KpiService.generateToBeInput(asIsKpi, toBeKpi);
                    toBeVariant.kpiList.push(toBeKpi);
                }
            });
            // remove kpis that has been removed in as is
            for(var i = toBeVariant.kpiList.length-1; i >= 0; i--) {
                if(!toBeVariant.kpiList[i].keep) {
                    toBeVariant.kpiList[i].splice(1, i);
                }
            }
            VariantService.saveVariant(toBeVariant);
        } else {
            initOutputs(toBeVariant);
        }
    }

  $scope.setScore = function(kpi) {

    var kpiModal, templateUrl, controller;

    if(kpi.qualitative) {
      templateUrl = 'qualitative-kpi-input/qualitative-kpi-input.tpl.html';
      controller = 'QualitativeKpiInputCtrl';
    } else {
      templateUrl = 'quantitative-kpi-input/quantitative-kpi-input.tpl.html';
      controller = 'QuantitativeKpiInputCtrl';
    }

    kpiModal = $modal.open({
        templateUrl: templateUrl,
        controller: controller,
        resolve: {
          kpi: function() {
            return kpi;
          }
        }
      });

      kpiModal.result.then(function (configuredKpi) {
        // update kpi in variant
        VariantService.updateKpi(toBeVariant, configuredKpi);
        // trigger update to kpi in scope
        kpi.outputs = configuredKpi.outputs;
      }, function () {
        console.log('Modal dismissed at: ' + new Date());
      });

  };


}]);

