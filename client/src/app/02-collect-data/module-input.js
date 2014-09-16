angular.module( 'idss-dashboard.collect-data.module-input', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'module-input', {
    url: '/module-input/:kpiId/:moduleId',
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
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'ModuleInputCtrl', ['$scope', 'ProcessService', '$stateParams', '$fileUploader', function ModuleInputCtrl( $scope, ProcessService, $stateParams, $fileUploader ) {

  if(!$stateParams.kpiId || !$stateParams.moduleId) {
    console.log('missing params');
    return;
  }

  // TODO: this is module input from modules stored (copied) to users process. 
  // If the module input format will change from the module spec 
  // - THE MODULE INDATA SPEC IN PROCESS NEED TO BE UPDATED
  // Create a test somehow to check if the module original spec has been updated

  var currentProcess = ProcessService.getCurrentProcess();

  var kpi = _.find(currentProcess.kpiList, function(kpi) {
    if(!kpi.selectedModule) {
      return false;
    } else {
      return kpi.id === $stateParams.kpiId && kpi.selectedModule.id === $stateParams.moduleId;
    }
  });

  if(!kpi) {
    console.log('missing module');
    return;
  }

  var module = kpi.selectedModule;

  console.log(module);

  // set template urls to all inputs to generate corresponding directive
  var setTemplateUrl = function(inputs) {
    _.each(inputs, function(input) {
      input.template = 'directives/module-inputs/' + input.type + '.tpl.html';
      if(input.inputs) {
        setTemplateUrl(input.inputs);
      }
    });
  };

  setTemplateUrl(module.inputs);

  $scope.module = module;
  $scope.kpiId = kpi.id;

}]);

