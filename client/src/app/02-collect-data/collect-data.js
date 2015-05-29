angular.module( 'idss-dashboard.collect-data', [
  'idss-dashboard.collect-data.define-context',
  'idss-dashboard.collect-data.module-input'
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

.controller( 'CollectDataCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', 'currentProcess', 'ModuleService', function CollectDataCtrl( $scope, KpiService, ProcessService, $modal, currentProcess, ModuleService ) {

  $scope.currentProcess = currentProcess;

  // TODO: create modal to upload files to process, this data is used for every module


}]);

