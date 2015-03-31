angular.module( 'idss-dashboard.collect-data', [
  'idss-dashboard.collect-data.define-context',
  'idss-dashboard.collect-data.module-input'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'collect-data', {
    url: '/collect-data',
    views: {
      "main": {
        controller: 'CollectDataCtrl',
        templateUrl: '02-collect-data/collect-data.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
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
    }, 
    data:{ 
      pageTitle: 'Collect Data',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'CollectDataCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', 'variants', 'ModuleService', function CollectDataCtrl( $scope, KpiService, ProcessService, $modal, variants, ModuleService ) {

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  _.each(asIsVariant.kpiList, function(kpi) {
    kpi.moduleId = kpi.selectedModule.id; 
    kpi.moduleName = kpi.selectedModule.name;
  });
  $scope.currentVariant = asIsVariant;

  $scope.moduleInputIsOk = function(module) {
    // create API call?
    return true;
  };

  $scope.setModuleInput = function(kpi) {
    if(kpi.selectedModule.id) {
    
      moduleInputModal = $modal.open({
          templateUrl: '02-collect-data/module-input.tpl.html',
          controller: 'ModuleInputController',
          resolve: {
            kpi: function() {
              return kpi;
            },
            currentVariant: function() {
              return $scope.currentVariant;
            }
          }
        });

        moduleInputModal.result.then(function (moduleInput) {

          ModuleService.saveModuleInput(moduleInput.variantId, moduleInput);
                  
        }, function () {
          console.log('Modal dismissed at: ' + new Date());
        });

      }

    };

}]);

