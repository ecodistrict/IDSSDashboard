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

  $scope.module = module;
  //$scope.moduleInputData = module.inputs;

  // after data is uploaded - add data to module
  var addInputDataToModule = function(inputs, inputId, data) {
    var found = false;
    _.each(inputs, function(input) {
      if(input.id === inputId) {
        input.data = data;
        found = true;
      }
      if(input.inputs && !found) {
        addInputDataToModule(input.inputs, inputId, data);
      }
    });
  };

  // when adding file source to module indata this is stored in 
  // module as reference
  var addItemToSource = function(inputs, inputId, item) {
    console.log(inputs, inputId, item);
    var found = false;
    _.each(inputs, function(input) {
      if(input.id === inputId) {
        input.sources = input.sources || [];
        input.sources.push({
          file:{
            name: item.file.name,
            path: item.file.path,
            size: item.file.size,
            lastModifiedDate: item.file.lastModifiedDate
          },
          formData: item.formData,
          isCancel: item.isCancel,
          isError: item.isError,
          isReady: item.isReady,
          isSuccess: item.isSuccess,
          isUploaded: item.isUploaded,
          progress: item.progress
        });
        found = true;
      }
      if(input.inputs && !found) {
        addItemToSource(input.inputs, inputId, item);
      }
    });
  };

  var uploadUrl = 'module/import/' + $stateParams.kpiId + '/' + $stateParams.moduleId;
  console.log(uploadUrl);

  var uploader = $scope.uploader = $fileUploader.create({
    scope: $scope, 
    url: uploadUrl
  });

  $scope.uploadFile = function(item, input) {
    console.log(input); 
    console.log('uploading file with for input id: ' + input.id);
    item.formData = [{inputType: input.type, inputId: input.id}];
    item.upload();
  };

  uploader.bind('success', function (event, xhr, item, response) {
      // TODO: add item formdata to input.sources array
      console.info('Success', xhr, item, response);
      var inputId = item.formData[0].inputId;
      console.log('adding data to input id: ' + inputId);
      addInputDataToModule(module.inputs, inputId, response.data); // TODO: set these on module service
      addItemToSource(module.inputs, inputId, item); // TODO: set these on module service
      ProcessService.setIsModified(true);
  });

  uploader.bind('cancel', function (event, xhr, item) {
      console.info('Cancel', xhr, item);
  });

  uploader.bind('error', function (event, xhr, item, response) {
      console.info('Error', xhr, item, response);
  });

  var addFileSource = function(inputs) {
    _.each(inputs, function(input) {
      if(input.sources) {
        _.each(input.sources, function(source) {
          uploader.queue.push(source);
        });
      }
      if(input.inputs) {
        addFileSource(input.inputs);
      }
    });
  };

  // this shows upload history, what sources has been added to input already
  // add that data to queue, and set status (for example a previous upload could have failed)
  addFileSource(module.inputs);

}]);

