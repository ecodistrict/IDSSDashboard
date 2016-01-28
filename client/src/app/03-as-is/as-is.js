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
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }],
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          return user;
        });
      }]
    }
  });
}])

.controller( 'AsIsController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'ModuleService', '$modal', 'KpiService', 'VariantService', 'activeCase', 'variants', 'currentUser', '$window', 
  function AsIsController( $scope, $timeout, $sce, socket, $state, ModuleService, $modal, KpiService, VariantService, activeCase, variants, currentUser, $window ) {

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
  if(asIsVariant.isNew) {
    socket.emit('createVariant', {
      userId: currentUser._id,
      variantId: asIsVariant._id,
      caseId: activeCase._id
    });
  }
  // $scope.variants = variants; // for map
  // $scope.currentVariant = asIsVariant; // for map
  $scope.currentCase = activeCase;
  $scope.currentUser = currentUser;

  _.each(activeCase.kpiList, function(kpi) {
    KpiService.removeExtendedData(kpi); // in case data is already extended 
    kpi.loading = true;
    kpi.status = 'initializing';

    socket.emit('getKpiResult', {
      variantId: asIsVariant._id, 
      kpiId: kpi.kpiAlias, 
      moduleId: kpi.selectedModuleId, 
      status: kpi.status,
      userId: $scope.currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
      processId: activeCase._id
    });

    $timeout(function() {
      kpi.status = kpi.status === 'initializing' ? 'unprocessed' : kpi.status;
      kpi.loading = false;
    }, 6000);

    // KpiService.getKpiRecord(asIsVariant._id, kpi.kpiAlias, $scope.currentUser._id).then(function(record) {
    //     delete kpi.asIsValue; // otherwise the comparison will be used in the visualisation
    //     angular.extend(kpi, record); 
    //     if(kpi.status === 'initializing' || kpi.status === 'processing') {
    //       kpi.loading = true;
    //     } else {
    //       kpi.loading = false;
    //     }
    // });
   
  });

  socket.on('createVariant', function(message) {
    console.log('create variant returned:', message);
  });

  socket.on('getKpiResult', function(kpiMessage) {
    var kpi = _.find(activeCase.kpiList, function(k) {
      return k.kpiAlias === kpiMessage.kpiId;
    });
    if(kpi) {
      kpi.value = kpiMessage.kpiValue;
      kpi.loading = false;
      kpi.status = kpiMessage.status;
    }
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
      $state.transitionTo('kpi', {variantId: asIsVariant._id, kpiAlias: kpi.kpiAlias, back: 'as-is'});
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

