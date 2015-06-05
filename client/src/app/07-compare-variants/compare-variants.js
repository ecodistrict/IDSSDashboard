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
      currentProcess: ['ProcessService', function(ProcessService) {
        return ProcessService.loadCurrentProcess().then(function(currentProcess) {
          return currentProcess;
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

.controller( 'CompareVariantsController', ['$scope', 'LoginService', 'variants', 'currentProcess', 'ModuleService', 'socket', 'KpiService', 'VariantService', function CompareVariantsController( $scope, LoginService, variants, currentProcess, ModuleService, socket, KpiService, VariantService ) {

  var currentUser;
  var mcmsmvData = {
    stakeholders: [] 
  };
  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    KpiService.getAllKpiRecords().then(function(kpiRecords) {
      _.each(kpiRecords.users, function(user) {
        var userRecords = _.filter(kpiRecords.records, function(r) {return user._id === r.userId;});
        createMCMSMVData(userRecords, user);
      });
      $scope.mcmsmv = mcmsmvData;
    });
  });

  $scope.sendData = {
    loading: false,
    status: 'unprocessed'
  };

  var createMCMSMVData = function(kpiRecords, user) {

    var stakeholderData = {
      user: {
        id: user._id,
        name: user.fname 
      },
      variants: [],
      kpiList: []
    };

    // add the used kpis to the stakeholder
    _.each(currentProcess.kpiList, function(k) {
      stakeholderData.kpiList.push({
        kpiName: k.name,
        kpiDescription: k.description,
        kpiId: k.alias,
        bad: k.bad,
        unit: k.unit,
        excellent: k.excellent 
      });
    });

    // add the variants and connect the kpi records by variantId and userId
    _.each(variants, function(v) {
      var relevantRecords = _.filter(kpiRecords, function(r) { return r.userId === user._id && r.variantId === v._id;});
      var kpiData = [];
      _.each(relevantRecords, function(r) {
        kpiData.push({
          kpiId: r.alias,
          kpiValue: r.value,
          disabled: r.disabled
        });
      });
      stakeholderData.variants.push({
        variantId: v._id,
        description: v.description,
        name: v.name,
        type: v.type,
        kpiList: kpiData
      });
    });

    mcmsmvData.stakeholders.push(stakeholderData);

    return mcmsmvData;

    // _.each(kpiRecords, function(r) {
    //   var kpiResults = [];
    //   _.each(r.kpiList, function(k) {
    //     // if as is variant, add settings to kpilist
    //     var bad = 1, excellent = 10;
    //     if(v.type === 'as-is') {
    //       if(!k.qualitative) {
    //         bad = k.settings.bad;
    //         excellent = k.settings.excellent;
    //       }
    //       stakeholderData.kpiList.push({
    //         kpiName: k.name,
    //         kpiDescription: k.description,
    //         kpiId: k.alias,
    //         bad: bad,
    //         unit: k.unit,
    //         excellent: excellent 
    //       });
    //     }
    //     getKpiResult(k, function(value) {
    //       kpiResults.push({
    //         kpiValue: value,
    //         kpiId: k.alias,
    //         disabled: k.disabled
    //       });
    //     });
    //   });
    //   stakeholderData.variants.push({
    //     variantId: v._id,
    //     description: v.description,
    //     name: v.name,
    //     type: v.type,
    //     kpiList: kpiResults
    //   });
    // });

    // mcmsmvData.stakeholders.push(stakeholderData);

    // return mcmsmvData;

  };

  $scope.sendToMCMSMV = function() {
    var modules = ModuleService.getModulesFromKpiId('mcmsmv');

    if(modules.length > 0) {

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
  // this is not used currently
  socket.on('mcmsmv', function(module) {
    console.log(module);
  });

}]);

