angular.module( 'idss-dashboard.compare-variants', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'compare-variants', {
    url: '/compare-variants',
    views: {
      "main": {
        controller: 'CompareVariantsController',
        templateUrl: '07-compare-variants/compare-variants.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Compare alternatives',
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

.controller( 'CompareVariantsController', ['$scope', 'LoginService', 'variants', 'ModuleService', 'socket', 'KpiService', 'VariantService', function CompareVariantsController( $scope, LoginService, variants, ModuleService, socket, KpiService, VariantService ) {

  var currentUser;
  var mcmsmvData = {
    stakeholders: [] 
  };
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    if(user.role === 'Facilitator') {
      VariantService.loadVariantsByProcessId().then(function(variantData) {
        _.each(variantData.users, function(user) {
          var userVariants = _.filter(variantData.variants, function(v) {return user._id === v.userId;});
          createMCMSMVData(userVariants, user);
        });
        $scope.mcmsmv = mcmsmvData;
      });
    } else {
      createMCMSMVData(variants, currentUser);
      $scope.mcmsmv = mcmsmvData;
    }
  });

  $scope.sendData = {
    loading: false,
    status: 'unprocessed'
  };

  var createMCMSMVData = function(variantData, user) {

    var stakeholderData = {
      user: {
        id: user._id || currentUser._id,
        name: user.fname ? user.fname : currentUser.fname 
      },
      variants: [],
      kpiList: []
    };

    var getKpiResult = function(kpi, cb) {
      KpiService.getResultKpiValue(kpi, function(value) {
        cb(value);
      });
    };

    _.each(variantData, function(v) {
      var kpiResults = [];
      _.each(v.kpiList, function(k) {
        // if as is variant, add settings to kpilist
        var bad = 1, excellent = 10;
        if(v.type === 'as-is') {
          if(!k.qualitative) {
            bad = k.settings.bad;
            excellent = k.settings.excellent;
          }
          stakeholderData.kpiList.push({
            kpiName: k.name,
            kpiDescription: k.description,
            kpiId: k.alias,
            bad: bad,
            unit: k.unit,
            excellent: excellent 
          });
        }
        getKpiResult(k, function(value) {
          kpiResults.push({
            kpiValue: value,
            kpiId: k.alias,
            disabled: k.disabled
          });
        });
      });
      stakeholderData.variants.push({
        variantId: v._id,
        description: v.description,
        name: v.name,
        type: v.type,
        kpiList: kpiResults
      });
    });

    mcmsmvData.stakeholders.push(stakeholderData);

    return mcmsmvData;

  };

  $scope.sendToMCMSMV = function() {
    var modules = ModuleService.getModulesFromKpiId('mcmsmv');

    if(modules.length > 0) {

      $scope.sendData.status = 'sending data';
      $scope.sendData.loading = true;

      socket.emit('mcmsmv', {
        variants: mcmsmvData,
        kpiId: 'mcmsmv',
        userId: currentUser._id
      });
      $scope.msg = JSON.stringify(mcmsmvData, undefined, 4);

    } else {
      $scope.msg = JSON.stringify(mcmsmvData, undefined, 4);
    }
  };

  // listen on any model that was started, for updating loading status
  socket.on('mcmsmv', function(module) {
    console.log(module);
    $scope.sendData.status = module.status;
    $scope.sendData.loading = false;
  });

}]);

