angular.module( 'idss-dashboard.to-be', [
  'idss-dashboard.to-be.ambitions-kpi',
  'idss-dashboard.to-be.to-be-overview'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'to-be', {
    url: '/to-be',
    views: {
      "main": {
        controller: 'ToBeController',
        templateUrl: '04-to-be/to-be.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'To be',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'ToBeController', ['$scope', 'ProcessService', '$modal', function ToBeController( $scope, ProcessService, $modal ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  $scope.configureKpi = function(kpi) {

    var kpiModal = $modal.open({
      templateUrl: '04-to-be/ambitions-kpi.tpl.html',
      controller: 'AmbitionsKpiCtrl',
      resolve: {
        kpi: function() {
          return kpi;
        }
      }
    });

    kpiModal.result.then(function (configuredKpi) {
      console.log(configuredKpi);
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

  $scope.kpiIsManaged = function(kpi) {
    return false;
  };


  // Show list of KPI - these should be configured for the TO BE state

  // create calculations for optimization to map to the desired values (this is actually not feasible)
  

}]);

