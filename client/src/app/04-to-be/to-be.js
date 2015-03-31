angular.module( 'idss-dashboard.to-be', [])

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
                KpiService.generateToBeInput(angular.copy(toBeKpi), toBeKpi);
            });
            VariantService.createVariant(toBeVariant).then(function(newVariant) {
              toBeVariant = newVariant;
              $scope.toBeVariant = KpiService.initOutputs(toBeVariant, asIsVariant);
              variants.push(toBeVariant);
            });
        } else if(asIsVariant.kpiList.length !== toBeVariant.kpiList.length) {
            VariantService.addOrRemoveKpis(asIsVariant, toBeVariant);
            VariantService.saveVariant(toBeVariant).then(function(savedVariant) {
              $scope.toBeVariant = KpiService.initOutputs(savedVariant, asIsVariant);
            });

        } else {
            $scope.toBeVariant = KpiService.initOutputs(toBeVariant, asIsVariant);
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

