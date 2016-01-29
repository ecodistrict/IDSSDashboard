angular.module( 'idss-dashboard.develop-variants', [
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
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(currentUser) {
          return currentUser;
        });
      }],
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

.controller( 'DevelopVariantsController', ['$scope', 'socket', 'currentUser', 'ProcessService', 'ContextService', '$modal', '$state', 'variants', 'VariantService', 
  function DevelopVariantsController( $scope, socket, currentUser, ProcessService, ContextService, $modal, $state, variants, VariantService ) {

  socket.forward('createVariant', $scope);
  socket.forward('deleteVariant', $scope);

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  $scope.variants = variants;

  $scope.addVariant = function() {
    var variant = {
        name: 'Alternative',
        type: 'variant',
        description: 'Description'
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
      VariantService.createVariant(configuredVariant).then(function(createdVariant) {
        socket.emit('createVariant', {
          caseId: asIsVariant.caseId,
          variantId: createdVariant._id,
          userId: currentUser._id
        });
        createdVariant.loading = true;
        $scope.variants.push(createdVariant);
      });
    }, function () {
        console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.deleteVariant = function(variant) {
    variant.loading = true;
    socket.emit('deleteVariant', {
      caseId: asIsVariant.caseId,
      variantId: variant._id,
      userId: currentUser._id
    });
  };

  $scope.$on('socket:createVariant', function (ev, data) {
    var variant = _.find($scope.variants, function(c) {
      return c._id === data.variantId;
    });
    variant.loading = false;
  });

  $scope.$on('socket:deleteVariant', function (ev, data) {
    console.log(data);
    var variant = _.find($scope.variants, function(c) {
      return c._id === data.variantId;
    });

    if(variant) {
      VariantService.deleteVariant({_id: data.variantId}).then(function(deletedVariant) {
        
        variant.loading = false;
        // remove from list
        var index = _.indexOf($scope.variants, variant);
        if (index > -1) {
            $scope.variants.splice(index, 1);
        }
      }); 
    }
  });

}]);

