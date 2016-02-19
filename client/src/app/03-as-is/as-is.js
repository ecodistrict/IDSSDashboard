angular.module( 'idss-dashboard.as-is', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'as-is', {
    url: '/as-is',
    views: {
      "main": {
        controller: 'AsIsController',
        templateUrl: '03-as-is/as-is.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'As is',
      authorizedRoles: ['Facilitator', 'Stakeholder']
    },
    resolve:{
      activeCase: ['CaseService', function(CaseService) {
        var p = CaseService.getActiveCase();
        if(p._id) {
          return p;
        } else {
          return CaseService.loadActiveCase();
        }
      }],
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          return user;
        });
      }]
    }
  });
}])

.controller( 'AsIsController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'ModuleService', '$modal', 'KpiService', 'VariantService', 'activeCase', 'currentUser', '$window', 
  function AsIsController( $scope, $timeout, $sce, socket, $state, ModuleService, $modal, KpiService, VariantService, activeCase, currentUser, $window ) {

  $scope.currentCase = activeCase;
  $scope.currentUser = currentUser;

  _.each(activeCase.kpiList, function(kpi) {
    KpiService.removeExtendedData(kpi); // always refresh the data 
    //kpi.loading = true;
    

    kpi.value = activeCase.kpiValues[kpi.kpiAlias];
    if(kpi.value || kpi.value === 0) {
      kpi.status = 'success';
    } else {
      kpi.status = 'unprocessed';
    }

    // socket.emit('getKpiResult', {
    //   kpiId: kpi.kpiAlias, 
    //   moduleId: kpi.selectedModuleId,
    //   status: kpi.status,
    //   userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
    //   caseId: activeCase._id
    // });

    // $timeout(function() {
    //   kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
    //   kpi.loading = false;
    // }, 6000);
   
  });

  $scope.getStatus = function(kpi) {
    if(kpi.status === 'unprocessed') {
      return 'warning';
    } else if(kpi.status === 'initializing') {
      return 'primary';
    } else if(kpi.status === 'processing') {
      return 'info';
    } else if(kpi.status === 'success') {
      return 'success';
    } 
  };

  $scope.goToKpiPage = function(kpi) {
    if(currentUser.role === 'Facilitator') {
      $state.transitionTo('kpi', {kpiAlias: kpi.kpiAlias, back: 'as-is'});
    }
  };

  $scope.goToCSModule = function(kpi) {
    console.log(kpi);
    $window.open('http://vps17642.public.cloudvps.com:3002/#?dashboard=' + kpi.kpiAlias);
  };

  $scope.selectMap = function() {
    $scope.trig = !$scope.trig;
  };

}]);

