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
      activeCase: ['CaseService', function(CaseService) {
        return CaseService.loadActiveCase().then(function(activeCase) {
          return activeCase;
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

.controller( 'CompareVariantsController', ['$scope', '$timeout', 'socket', 'LoginService', 'variants', 'activeCase', 'ModuleService', 'socket', 'KpiService', 'VariantService', 
  function CompareVariantsController( $scope, $timeout, socket, LoginService, variants, activeCase, ModuleService, socket, KpiService, VariantService ) {

  var currentUser;
  var mcmsmvData = {
    stakeholders: [] 
  };
  var stakeholders;
  var kpiDefaultValueMap = {}; 
  var kpiValueMap = {};

  LoginService.getCurrentUser().then(function(user) {
    currentUser = user;
    socket.emit('getKpiResult', {
      userId: user._id,
      caseId: activeCase._id
    });
    
    
    // KpiService.getAllKpiRecords().then(function(kpiRecords) {

    //   // find the first user with facilitatorId
    //   var firstStakeholder = _.find(kpiRecords.users, function(u) {return u.facilitatorId;});
    //   var kpiDefaultValueMap = {}; //_.indexBy(activeCase.kpiList, 'kpiAlias');
    //   var kpiValueMap = {};

    //   // find defaults from facilitator and map kpi values in records
    //   _.each(kpiRecords.records, function(record) {

    //     // set the default values from facilitator (if no stakeholder is found, this step is not needed)
    //     kpiDefaultValueMap[record.variantId] = kpiDefaultValueMap[record.variantId] || {};
    //     if(firstStakeholder && firstStakeholder.facilitatorId === record.userId) {
    //       // facilitatorId, kpiAlias and variantId is unique key
    //       kpiDefaultValueMap[record.variantId][record.kpiAlias] = {value: record.value, disabled: record.disabled};
    //     }

    //     // map on variant and kpi
    //     kpiValueMap[record.userId] = kpiValueMap[record.userId] || {};

    //     kpiValueMap[record.userId][record.variantId] = kpiValueMap[record.userId][record.variantId] || {};
    //     // this map is for weights and minimum (one for every user and kpi)
    //     kpiValueMap[record.userId][record.kpiAlias] = kpiValueMap[record.userId][record.kpiAlias] || {};
    //     // this map is for values on each variant
    //     kpiValueMap[record.userId][record.variantId][record.kpiAlias] = {value: record.value, disabled: record.disabled};
    //     // this map set min, weight
    //     kpiValueMap[record.userId][record.kpiAlias] = {weight: record.weight, minimum: record.minimum};

    //   });

    //   // create structure user/variant/kpi
    //   _.each(kpiRecords.users, function(user) {
    //     // create stakeholder data
    //     var stakeholderData = {
    //       user: {
    //         id: user._id,
    //         name: user.name || 'Facilitator'
    //       },
    //       variants: [],
    //       kpiList: []
    //     };
    //     _.each(activeCase.kpiList, function(kpi) {
    //       var kpiBaseData = {
    //         kpiName: kpi.name,
    //         kpiDescription: kpi.description,
    //         kpiId: kpi.kpiAlias,
    //         unit: kpi.unit,
    //         sufficient: kpi.sufficient,
    //         excellent: kpi.excellent
    //       };
    //       // this is now done for each user, that's not optimal..
    //       kpiBaseData.bad = calculateBad(kpi.sufficient, kpi.excellent);
    //       if(kpiValueMap[user._id] && kpiValueMap[user._id][kpi.kpiAlias]) {
    //         kpiBaseData.weight = kpiValueMap[user._id][kpi.kpiAlias].weight;
    //         kpiBaseData.minimum = kpiValueMap[user._id][kpi.kpiAlias].minimum;
    //       }
    //       stakeholderData.kpiList.push(kpiBaseData);

    //     });
        
    //     // add to global data object
    //     mcmsmvData.stakeholders.push(stakeholderData);
    //     // add variants to variants list
    //     _.each(variants, function(variant) {
    //       // create variant data
    //       var variantData = {
    //         variantId: variant._id,
    //         description: variant.description,
    //         name: variant.name,
    //         type: variant.type,
    //         kpiList: []
    //       };
    //       // add to stakeholder reference
    //       stakeholderData.variants.push(variantData);
    //       // add kpis to kpi list
    //       _.each(activeCase.kpiList, function(kpi) {

    //         var kpiValue, disabled = false;

    //         if(kpiValueMap[user._id] && kpiValueMap[user._id][variant._id] && kpiValueMap[user._id][variant._id][kpi.kpiAlias]) {
    //           kpiValue = kpiValueMap[user._id][variant._id][kpi.kpiAlias].value;
    //           disabled = kpiValueMap[user._id][variant._id][kpi.kpiAlias].disabled; // this is for facilitator only
    //         } else {
    //           // if this is undefined not even the facilitator has given a value to the kpi (no record has been found for variant)
    //           if(kpiDefaultValueMap[variant._id] && kpiDefaultValueMap[variant._id][kpi.kpiAlias]) {
    //             kpiValue = kpiDefaultValueMap[variant._id][kpi.kpiAlias].value;
    //             // this is not very good, but it works for now - if no value was found for stakeholder, the disabled property can be set from the facilitator default
    //             disabled = kpiDefaultValueMap[variant._id][kpi.kpiAlias].disabled; 
    //           }
    //         }
    //         // create kpi data
    //         var kpiData = {
    //           kpiId: kpi.kpiAlias,
    //           kpiValue: kpiValue,
    //           disabled: disabled
    //         };
    //         // add to variant reference
    //         variantData.kpiList.push(kpiData);
    //       });
    //     });
    //   });

    //   $scope.mcmsmv = mcmsmvData;

    // });
  });

  socket.on('getKpiResult', function(records) {

    // if first response message with records, get all stakeholder records
    if(records && records.length && records.length > 1) {
      // if facilitator
      if(records[0].userId === currentUser._id) {
        // request the stakeholder data
        LoginService.getStakeholders().then(function(s) {
          stakeholders = s;
          if(stakeholders && stakeholders.length && stakeholders.length > 0) {
            _.each(stakeholders, function(s) {
              socket.emit('getKpiResult', {
                userId: s._id,
                caseId: activeCase._id
              });
            });
          }
        });
        _.each(records, function(record) {
          // set the facilitator data as default values
          kpiDefaultValueMap[record.variantId] = kpiDefaultValueMap[record.variantId] || {};
          kpiDefaultValueMap[record.variantId][record.kpiId] = {value: record.value, disabled: record.disabled};
        });
        

      } else {
        // fill kpi value map
        _.each(records, function(record) {
          // map on variant and kpi
          kpiValueMap[record.userId] = kpiValueMap[record.userId] || {};
          kpiValueMap[record.userId][record.variantId] = kpiValueMap[record.userId][record.variantId] || {};
          // this map is for values on each variant
          kpiValueMap[record.userId][record.variantId][record.kpiAlias] = {value: record.value, disabled: record.disabled};
          
        }); 
        // now loop through stakeholders to generate the mcmsmv data
        _.each(stakeholders, function(stakeholder) {
          // create stakeholder data
          var stakeholderData = {
            user: {
              id: stakeholder._id,
              name: stakeholder.name
            },
            variants: [],
            kpiList: []
          };
          // fill stakeholders kpi list
          _.each(activeCase.kpiList, function(kpi) {
            var kpiBaseData = {
              kpiName: kpi.name,
              kpiDescription: kpi.description,
              kpiId: kpi.kpiAlias,
              unit: kpi.unit,
              sufficient: kpi.sufficient,
              excellent: kpi.excellent
            };
            // calculate bad, this is now done for each user, that's not optimal..
            kpiBaseData.bad = calculateBad(kpi.sufficient, kpi.excellent);
            // find weight
            if(stakeholder.kpiWeights[activeCase._id] && stakeholder.kpiWeights[activeCase._id][kpi.kpiAlias]) {
              kpiBaseData.weight = stakeholder.kpiWeights[activeCase._id][kpi.kpiAlias];
            } else {
              kpiBaseData.weight = 0;
            }
            // push kpi base data to stakeholders kpi list
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
            _.each(activeCase.kpiList, function(kpi) {

              var kpiValue, disabled = false;

              if(kpiValueMap[user._id] && kpiValueMap[user._id][variant._id] && kpiValueMap[user._id][variant._id][kpi.kpiAlias]) {
                kpiValue = kpiValueMap[user._id][variant._id][kpi.kpiAlias].value;
                disabled = kpiValueMap[user._id][variant._id][kpi.kpiAlias].disabled; // this is for facilitator only
              } else {
                // if this is undefined not even the facilitator has given a value to the kpi (no record has been found for variant)
                if(kpiDefaultValueMap[variant._id] && kpiDefaultValueMap[variant._id][kpi.kpiAlias]) {
                  kpiValue = kpiDefaultValueMap[variant._id][kpi.kpiAlias].value;
                  // this is not very good, but it works for now - if no value was found for stakeholder, the disabled property can be set from the facilitator default
                  disabled = kpiDefaultValueMap[variant._id][kpi.kpiAlias].disabled; 
                }
              }
              // create kpi data
              var kpiData = {
                kpiId: kpi.kpiAlias,
                kpiValue: kpiValue,
                disabled: disabled
              };
              // add to variant reference
              variantData.kpiList.push(kpiData);
            });
          });
        });
      }
    } 
      
  });

  $timeout(function(){
    // this should be triggered when everything is loaded
    $scope.mcmsmv = mcmsmvData;
  }, 6000);

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

  function calculateBad(sufficient, excellent) {
    if((!excellent && excellent !== 0) || (!sufficient && sufficient !== 0)) {
      return 0;
    } 
    // span is a 6 out of 10
    var span = Math.abs(sufficient - excellent) * 1.5;
    if(sufficient >= excellent) {
      return sufficient + span;
    } else {
      return sufficient - span;
    }
  }

}]);

