angular.module( 'idss-dashboard.develop-variants', [
  'idss-dashboard.develop-variants.variant-input',
  'idss-dashboard.develop-variants.add-variant'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'develop-variants', {
    url: '/develop-variants',
    views: {
      "main": {
        controller: 'DevelopVariantsController',
        templateUrl: '05-develop-variants/develop-variants.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Develop variants',
      authorizedRoles: ['Facilitator', 'Stakeholder']
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

.controller( 'DevelopVariantsController', ['$scope', 'ProcessService', 'ContextService', '$modal', '$state', 'variants', 'VariantService', function DevelopVariantsController( $scope, ProcessService, ContextService, $modal, $state, variants, VariantService ) {

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  $scope.variants = variants;

  $scope.addVariant = function() {
    var variant = {
        name: 'Alternative',
        type: 'variant',
        description: 'Description',
        kpiList: []
    };

    var variantModal = $modal.open({
        templateUrl: '05-develop-variants/add-variant.tpl.html',
        controller: 'AddVariantController',
        resolve: {
          variant: function() {
            return variant;
          }
        }
    });

    variantModal.result.then(function (configuredVariant) {
      VariantService.addOrRemoveKpis(asIsVariant, configuredVariant);
      VariantService.createVariant(configuredVariant).then(function(createdVariant) {
        $scope.variants.push(createdVariant);
      });
    }, function () {
        console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.deleteVariant = function(variant) {
    VariantService.deleteVariant(variant).then(function(deletedVariant) {
      var index = _.indexOf(variants, variant);
      variants.splice(1, index);
    });
  };

}]);

