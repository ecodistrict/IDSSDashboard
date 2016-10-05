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
      activeCase: ['CaseService', function(CaseService) {
        var p = CaseService.getActiveCase();
        if(p._id) {
          return p;
        } else {
          return CaseService.loadActiveCase();
        }
      }],
      variants: ['VariantService', function(VariantService) {
        return VariantService._loadVariants();
      }]
    }
  });
}])

.controller( 'DevelopVariantsController', ['$scope', '$window', 'socket', 'currentUser', 'activeCase', 'ContextService', '$modal', '$state', 'variants', 'VariantService', 
  function DevelopVariantsController( $scope, $window, socket, currentUser, activeCase, ContextService, $modal, $state, variants, VariantService ) {

  socket.forward('createVariant', $scope);
  socket.forward('deleteVariant', $scope);

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
          caseId: currentUser.activeCaseId,
          variantId: createdVariant._id,
          userId: currentUser._id
        });
        //createdVariant.loading = true;
        $scope.variants.push(createdVariant);
      });
    }, function () {
        console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.editVariant = function(variant) {
    
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
      VariantService.saveVariant(configuredVariant).then(function(savedVariant) {
        variant.name = savedVariant.name;
        variant.description = savedVariant.description;
      });
    }, function () {
        console.log('Modal dismissed at: ' + new Date());
    });
  };

  $scope.deleteVariant = function(variant) {
    variant.loading = true;
    VariantService.deleteVariant(variant).then(function(deletedVariant) {
      //variant.loading = false;
      // remove from list
      var index = _.indexOf($scope.variants, variant);
      if (index > -1) {
          $scope.variants.splice(index, 1);
      }
      // emit message for delete variant
      // IMPORTANT: now there is no garantee that the variant is deleted in the database 
      // this is possible because dashboard should be able to run in stand-alone mode
      socket.emit('deleteVariant', {
        caseId: currentUser.activeCaseId,
        variantId: variant._id,
        userId: currentUser._id
      });
    }); 
  };

  $scope.checkDataModuleStatus = function(variant) {

    variant.loading = true;
    
    socket.emit('createVariant', {
      caseId: activeCase._id,
      variantId: variant._id,
      userId: variant.userId,
      name: variant.name,
      description: variant.description
    });  
      
  };

  $scope.$on('socket:createVariant', function (ev, data) {
    var currentVariant = $scope.variants.find(function(v) {return v._id === data.variantId;});
    if(currentVariant) {
      currentVariant.loading = false;
      currentVariant.dataModuleStatus = data.status;
    }
  });

  $scope.$on('socket:deleteVariant', function (ev, data) {
    console.log(data);
    var variant = _.find($scope.variants, function(c) {
      return c._id === data.variantId;
    });

    console.log('fix me: deletion of variants is not garanteed in data module. TODO: some check to see the data module state');
  });

  $scope.goToDesignModule = function(variant) {
    $window.open('http://vps17642.public.cloudvps.com/?session=' + activeCase._id + '$' + variant._id + '$' + $scope.currentUser._id);
  };

  $scope.goToUploadDataModule = function(variant) {
    $window.open('http://ecodistrict.cstb.fr/?session=' + activeCase._id + '$' + variant._id + '$' + $scope.currentUser._id);
  };

}]);

