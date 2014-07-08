angular.module( 'idss-dashboard.analyse-problem.manage-kpis', [
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'manage-kpis', {
    url: '/analyse-problem/manage-kpis',
    views: {
      "main": {
        controller: 'ManageKpisCtrl',
        templateUrl: '01-analyse-problem/manage-kpis.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Manage KPIs',
      authorizedRoles: ['facilitator']
    }
  });
})

.controller( 'ManageKpisCtrl', ['$scope', function ManageKpisCtrl( $scope ) {

  console.log('manage kpis');

}]);

