angular.module( 'idss-dashboard.assess-variants', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'assess-variants', {
    url: '/assess-variants',
    views: {
      "main": {
        controller: 'AssessVariantsController',
        templateUrl: '06-assess-variants/assess-variants.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Assess alternatives',
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

.controller( 'AssessVariantsController', ['$scope', 'LoginService', 'variants', 'ModuleService', 'socket', function AssessVariantsController( $scope, LoginService, variants, ModuleService, socket ) {

  var currentUser;
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
  });

  $scope.sendData = {
    loading: false,
    status: 'unprocessed'
  };

  $scope.sendToMCMSMV = function() {
    var modules = ModuleService.getModulesFromKpiId('mcmsmv');
    console.log(variants);
    if(modules.length > 0) {

      $scope.sendData.status = 'sending data';
      $scope.sendData.loading = true;

      socket.emit('mcmsmv', {
        variants: variants,
        kpiId: 'mcmsmv',
        userId: currentUser._id
      });
      $scope.msg = "";
    } else {
      $scope.msg = "Module not found";
    }
  };

  // listen on any model that was started, for updating loading status
  socket.on('mcmsmv', function(module) {
    console.log(module);
    $scope.sendData.status = module.status;
    $scope.sendData.loading = false;
  });

}]);

