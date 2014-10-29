angular.module( 'idss-dashboard.collect-data.module-input', [
  'idss-dashboard.collect-data.module-input.file-result'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'module-input', {
    url: '/collect-data/module-input/:kpiAlias',
    views: {
      "main": {
        controller: 'ModuleInputCtrl',
        templateUrl: '02-collect-data/module-input.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Module input',
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
    }, 
  });
}])

.controller( 'ModuleInputCtrl', ['$scope', 'ProcessService', '$stateParams', '$fileUploader', 'variants', function ModuleInputCtrl( $scope, ProcessService, $stateParams, $fileUploader, variants ) {

  if(!$stateParams.kpiAlias) {
    console.log('missing params');
    return;
  }

  // TODO: this is module input from modules stored (copied) to users process. 
  // If the module input format will change from the module spec 
  // - THE MODULE INDATA SPEC IN PROCESS NEED TO BE UPDATED
  // Create a test somehow to check if the module original spec has been updated

  $scope.asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

  var kpi = _.find($scope.asIsVariant.kpiList, function(k) {
    return k.alias === $stateParams.kpiAlias;
  });

  if(!kpi) {
    console.log('missing module');
    return;
  }

  // var module = kpi.selectedModule;

  // console.log(module);

  // // set template urls to all inputs to generate corresponding directive
  // var setTemplateUrl = function(inputs) {
  //   _.each(inputs, function(input) {
  //     input.template = 'directives/module-inputs/' + input.type + '.tpl.html';
  //     if(input.inputs) {
  //       setTemplateUrl(input.inputs);
  //     }
  //   });
  // };

  // setTemplateUrl(module.inputs);

  $scope.module = kpi.selectedModule;

  // TODO: find the input of module!

  console.log($scope.module);

}]);

