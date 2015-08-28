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

      // find the first user with facilitatorId
      var firstStakeholder = _.find(kpiRecords.users, function(u) {return u.facilitatorId;});
      var kpiDefaultValueMap = {}; //_.indexBy(currentProcess.kpiList, 'kpiAlias');
      var kpiValueMap = {};

      // find defaults from facilitator and map kpi values in records
      _.each(kpiRecords.records, function(record) {

        // set the default values from facilitator (if no stakeholder is found, this step is not needed)
        kpiDefaultValueMap[record.variantId] = kpiDefaultValueMap[record.variantId] || {};
        if(firstStakeholder && firstStakeholder.facilitatorId === record.userId) {
          // facilitatorId, kpiAlias and variantId is unique key
          kpiDefaultValueMap[record.variantId][record.kpiAlias] = record.value;
        }

        // map on variant and kpi
        kpiValueMap[record.userId] = kpiValueMap[record.userId] || {};

        kpiValueMap[record.userId][record.variantId] = kpiValueMap[record.userId][record.variantId] || {};
        // this map is for weights and minimum (one for every user and kpi)
        kpiValueMap[record.userId][record.kpiAlias] = kpiValueMap[record.userId][record.kpiAlias] || {};
        // this map is for values on each variant
        kpiValueMap[record.userId][record.variantId][record.kpiAlias] = {value: record.value};
        // this map set min, weight
        kpiValueMap[record.userId][record.kpiAlias] = {weight: record.weight, minimum: record.minimum};

      });

      // create structure user/variant/kpi
      _.each(kpiRecords.users, function(user) {
        // create stakeholder data
        var stakeholderData = {
          user: {
            id: user._id,
            name: user.name || 'Facilitator'
          },
          variants: [],
          kpiList: []
        };
        _.each(currentProcess.kpiList, function(kpi) {
          var kpiBaseData = {
            kpiName: kpi.name,
            kpiDescription: kpi.description,
            kpiId: kpi.kpiAlias,
            unit: kpi.unit,
            sufficient: kpi.sufficient,
            excellent: kpi.excellent
          };
          if(kpiValueMap[user._id] && kpiValueMap[user._id][kpi.kpiAlias]) {
            kpiBaseData.weight = kpiValueMap[user._id][kpi.kpiAlias].weight;
            kpiBaseData.minimum = kpiValueMap[user._id][kpi.kpiAlias].minimum;

            console.log(kpiBaseData);
          }
          stakeholderData.kpiList.push(kpiBaseData);

        });
        
        // add to global data object
        mcmsmvData.stakeholders.push(stakeholderData);
        // add variants to variants list
        _.each(variants, function(variant) {
          // create variant data
          var variantData = {
            variantId: variant._id,
            description: variant.description,
            name: variant.name,
            type: variant.type,
            kpiList: []
          };
          // add to stakeholder reference
          stakeholderData.variants.push(variantData);
          // add kpis to kpi list
          _.each(currentProcess.kpiList, function(kpi) {

            var kpiValue, weight, minimum;

            if(kpiValueMap[user._id] && kpiValueMap[user._id][variant._id] && kpiValueMap[user._id][variant._id][kpi.kpiAlias]) {
              kpiValue = kpiValueMap[user._id][variant._id][kpi.kpiAlias].value;
            } else {
              // if this is undefined not even the facilitator has given a value to the kpi (no record has been found for variant)
              if(kpiDefaultValueMap[variant._id]) {
                kpiValue = kpiDefaultValueMap[variant._id][kpi.kpiAlias];
              }
            }
            // create kpi data
            var kpiData = {
              kpiId: kpi.kpiAlias,
              kpiValue: kpiValue
            };
            // add to variant reference
            variantData.kpiList.push(kpiData);
          });
        });
      });

      $scope.mcmsmv = mcmsmvData;

    });
  });

  $scope.sendData = {
    loading: false,
    status: 'unprocessed'
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

