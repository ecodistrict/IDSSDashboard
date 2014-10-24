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

.controller( 'UploadCtrl', ['$scope', '$fileUploader', 'ProcessService', function UploadCtrl( $scope, $fileUploader, ProcessService ) {
  
  var uploadUrl = 'process/upload';

  var uploader = $scope.uploader = $fileUploader.create({
    scope: $scope, 
    url: uploadUrl
  });

  uploader.bind('success', function (event, xhr, item, response) {
      // TODO: add item formdata to input.sources array
      console.info('Success', xhr, item, response);
      ProcessService.updateProcess(response);
      $scope.$apply();
  });

  uploader.bind('cancel', function (event, xhr, item) {
      console.info('Cancel', xhr, item);
  });

  uploader.bind('error', function (event, xhr, item, response) {
      console.info('Error', xhr, item, response);
  });

}]);

