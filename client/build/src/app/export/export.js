angular.module( 'idss-dashboard.export', [
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'export', {
    url: '/export',
    views: {
      "main": {
        controller: 'ExportCtrl',
        templateUrl: 'export/export.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Export',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'ExportCtrl', ['$scope', 'ProcessService', 'ExportService', function ExportCtrl( $scope, ProcessService, ExportService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  $scope.downloadCurrentProcess = function() {
    ExportService.downloadProcessAsEcodistFile($scope.currentProcess).then(function(file) {
      $scope.exportTitle = file.title + '.ecodist';
      $scope.exportResult = 'export/' + file.title + '.ecodist';
    });
  };

}]);

