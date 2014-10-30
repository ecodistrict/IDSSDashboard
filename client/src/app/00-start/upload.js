angular.module( 'idss-dashboard.start.upload', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'upload-process', {
    url: '/start/upload',
    views: {
      "main": {
        controller: 'UploadCtrl',
        templateUrl: '00-start/upload.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Upload process file',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'UploadCtrl', ['$scope', 'FileUploader', 'ProcessService', '$state', function UploadCtrl( $scope, FileUploader, ProcessService, $state ) {
  
  var uploadUrl = 'processes/upload';

  var uploader = $scope.uploader = new FileUploader({
    url: uploadUrl
  });

  // uploader.bind('success', function (event, xhr, item, response) {
  //     // TODO: add item formdata to input.sources array
  //     console.info('Success', xhr, item, response);
  //     ProcessService.updateProcess(response);
  //     $state.transitionTo('analyse-problem');
  // });

  // uploader.bind('cancel', function (event, xhr, item) {
  //     console.info('Cancel', xhr, item);
  // });

  // uploader.bind('error', function (event, xhr, item, response) {
  //     console.info('Error', xhr, item, response);
  // });

}]);

