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

.controller( 'AssessVariantsController', ['$scope', 'LoginService', 'variants', 'ModuleService', 'socket', 'KpiService', function AssessVariantsController( $scope, LoginService, variants, ModuleService, socket, KpiService ) {

  var currentUser;
  var mcmsmv;
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    mcmsmv = createMCMSMVData(variants);
  });

  $scope.sendData = {
    loading: false,
    status: 'unprocessed'
  };

  var createMCMSMVData = function(variantData) {

    var stakeholderData = {
      user: {
        id: currentUser._id,
        name: currentUser.fname + ' ' + currentUser.lname
      },
      variants: [],
      kpiList: []
    };

    var mcmsmvData = {
      stakeholders: [] 
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
        var bad = 0, excellent = 10;
        if(v.type === 'as-is') {
          if(!k.qualitative) {
            bad = k.settings.kpiScores.inputs.kpiScoreBad.value;
            excellent = k.settings.kpiScores.inputs.kpiScoreExcellent.value;
          }
          stakeholderData.kpiList.push({
            kpiName: k.name,
            kpiDescription: k.description,
            kpiId: k.alias,
            weight: k.settings.priorityLabel.inputs.priorityValue.value,
            bad: bad,
            excellent: excellent 
          });
        }
        getKpiResult(k, function(value) {
          kpiResults.push({
            kpiValue: value,
            kpiId: k.alias
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
        variants: variants,
        kpiId: 'mcmsmv',
        userId: currentUser._id
      });
      $scope.msg = JSON.stringify(mcmsmv, undefined, 4);

    } else {
      $scope.msg = JSON.stringify(mcmsmv, undefined, 4);
    }
  };

  // listen on any model that was started, for updating loading status
  socket.on('mcmsmv', function(module) {
    console.log(module);
    $scope.sendData.status = module.status;
    $scope.sendData.loading = false;
  });

}]);

