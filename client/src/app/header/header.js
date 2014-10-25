angular.module( 'idss-dashboard.header', [])

.controller( 'HeaderCtrl', ['$scope', '$location', 'LoginService', '$state', '$rootScope', function HeaderCtrl( $scope, $location, LoginService, $state, $rootScope ) {

    $scope.logout = function() {

        LoginService.logout();

    };

    $scope.$on('$stateChangeSuccess', function(event, toState){

        var urlParts = toState.url.split('/');

        $scope.highLightInMenu = urlParts[0] === "" ? urlParts[1] : urlParts[0];

    });

}]);