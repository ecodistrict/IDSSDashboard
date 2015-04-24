angular.module( 'idss-dashboard.header', [])

.controller( 'HeaderCtrl', ['$scope', '$location', 'LoginService', '$state', '$rootScope', 'ProcessService', function HeaderCtrl( $scope, $location, LoginService, $state, $rootScope, ProcessService ) {

    $scope.logout = function() {

        LoginService.logout();
    };

    $scope.$on('$stateChangeSuccess', function(event, toState){

        var urlParts = toState.url.split('/');

        $scope.highLightInMenu = urlParts[0] === "" ? urlParts[1] : urlParts[0];

    });

    $scope.deleteProcess = function() {
    	ProcessService.deleteCurrentProcess().then(function() {
    		// when loading a non existing process, a new process is created
    		ProcessService.loadCurrentProcess().then(function(newProcess) {
    			$scope.currentProcess = newProcess;
                $state.transitionTo('start');
    		});
    	});
    };

    $scope.loginAsFacilitator = function() {

        LoginService.logout().then(function(loggedOut) {
            if(loggedOut === true) {
                // get the facilitator name from facilitator id, promt for password
                LoginService.login({username: 'testuser@test.test', password: 'testing'}).then(function(user) {
                    $state.transitionTo('analyse-problem');
                });
            } else {
                console.log('TODO: handle this, user was not logged out');
            }
        });
    };

}]);