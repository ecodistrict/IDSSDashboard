angular.module( 'idss-dashboard.analyse-problem.kpi-input', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'kpi-input', {
    url: '/kpi-input/:kpiId',
    views: {
      "main": {
        controller: 'KpiInputCtrl',
        templateUrl: '01-analyse-problem/kpi-input.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Kpi input',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'KpiInputCtrl', ['$scope', 'ProcessService', '$stateParams', 'FileUploader', function KpiInputCtrl( $scope, ProcessService, $stateParams, FileUploader ) {

  if(!$stateParams.kpiId) {
    console.log('missing params');
    return;
  }

  var currentProcess = ProcessService.getCurrentProcess();

  var kpi = _.find(currentProcess.kpiList, function(kpi) {
    return kpi.alias === $stateParams.kpiId;
  });

  if(!kpi) {
    console.log('missing module');
    return;
  }

  $scope.kpi = kpi;

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

  var uploadUrl = 'kpi/import/' + $stateParams.kpiId;
  console.log(uploadUrl);

  var uploader = $scope.uploader = new FileUploader({
    url: uploadUrl
  });

  $scope.uploadFile = function(item, input) {
    console.log(input); 
    console.log('uploading file with for input id: ' + input.id);
    item.formData = [{inputType: input.type, inputId: input.id}];
    item.upload();
  };

  // uploader.bind('success', function (event, xhr, item, response) {
  //     // TODO: add item formdata to input.sources array
  //     console.info('Success', xhr, item, response);
  //     var inputId = item.formData[0].inputId;
  //     console.log('adding data to input id: ' + inputId);
  //     addInputDataToModule(module.inputs, inputId, response.data); // TODO: set these on module service
  //     addItemToSource(module.inputs, inputId, item); // TODO: set these on module service
  //     ProcessService.setIsModified(true);
  // });

  // uploader.bind('cancel', function (event, xhr, item) {
  //     console.info('Cancel', xhr, item);
  // });

  // uploader.bind('error', function (event, xhr, item, response) {
  //     console.info('Error', xhr, item, response);
  // });

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
  addFileSource(kpi.inputs);

}]);

