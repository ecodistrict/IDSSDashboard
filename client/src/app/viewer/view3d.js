angular.module( 'idss-dashboard.view3d', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'view3d', {
    url: '/view3d',
    views: {
      "main": {
        controller: 'View3dController',
        templateUrl: 'viewer/view3d.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'View 3D',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'View3dController', ['$scope', 'socket', function View3dController( $scope, socket) {

  socket.send('get3dData');

  socket.on('3dData', function(data) {
    $scope.scene = {
      faceGeometries: []
    };
    $scope.scene.faceGeometries = $scope.scene.faceGeometries.concat(data);

  });

}]);

