angular.module( 'idss-dashboard.collect-data', [
  'idss-dashboard.collect-data.define-context',
  'idss-dashboard.collect-data.module-input',
  'idss-dashboard.collect-data.reset-input'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'collect-data', {
    url: '/collect-data',
    views: {
      "main": {
        controller: 'CollectDataCtrl',
        templateUrl: '02-collect-data/collect-data.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    resolve:{
      currentProcess: ['ProcessService', function(ProcessService) {
        var p = ProcessService.getCurrentProcess();
        if(p._id) {
          return p;
        } else {
          return ProcessService.loadCurrentProcess();
        }
      }]
    }, 
    data:{ 
      pageTitle: 'Collect Data',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'CollectDataCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', 'currentProcess', 'ModuleService', 'FileUploader', function CollectDataCtrl( $scope, KpiService, ProcessService, $modal, currentProcess, ModuleService, FileUploader) {

  $scope.currentProcess = currentProcess;

  var uploader = $scope.uploader = new FileUploader({
      url: 'import/geojson'
  });

  $scope.uploadFile = function(item) {
      item.upload();
  };

  uploader.onSuccessItem = function(item, response, status, headers) {
      console.info('Success');
      $scope.dataSource = response.data; // this triggers update in other directives that listens on input (geojson for ex)
  };

  uploader.onErrorItem = function(item, response, status, headers) {};

  uploader.onCancelItem = function(item, response, status, headers) {};

  // TODO: create modal to upload files to process, this data is used for every module


}]);

