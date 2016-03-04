angular.module( 'idss-dashboard.header', [
    'idss-dashboard.header.reenterpassword'
])

.controller( 'HeaderCtrl', ['$scope', '$location', 'LoginService', '$state', '$rootScope', 'CaseService', '$modal', 'authService', '$rootScope', function HeaderCtrl( $scope, $location, LoginService, $state, $rootScope, CaseService, $modal, authService, $rootScope ) {

    // get current case
    CaseService.loadActiveCase().then(function(activeCase) {
        $scope.currentCase = activeCase;
    });

    $scope.logout = function() {

        LoginService.logout().then(function() {
            $scope.isAuthenticated = LoginService.isAuthenticated();
            $state.reload();
        });
        

    };

    $scope.$on('$stateChangeSuccess', function(event, toState){

        var urlParts = toState.url.split('/');

        $scope.highLightInMenu = urlParts[0] === "" ? urlParts[1] : urlParts[0];

    });

    $scope.loginAsFacilitator = function() {

        var passwordModal = $modal.open({
              templateUrl: 'header/reenter-password.tpl.html',
              controller: 'ReenterPasswordCtrl',
              resolve: {
                username: function() {
                  return $scope.currentUser.email;
                }
              }
            });

        passwordModal.result.then(function (credentials) {

            LoginService.logout().then(function(loggedOut) {
                if(loggedOut === true) {
                    // get the facilitator name from facilitator id, promt for password
                    LoginService.login(credentials).then(function(user) {
                        authService.loginConfirmed();
                    });
                } else {
                    console.log('TODO: handle this, user was not logged out');
                }
            });
              
        }, function () {
            console.log('Modal dismissed at: ' + new Date());
        });
            

    };

}]);