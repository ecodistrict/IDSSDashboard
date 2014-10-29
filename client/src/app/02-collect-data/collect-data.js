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
      variants: ['VariantService', function(VariantService) {
        var v = VariantService.getVariants();
        if(v) {
          return v;
        } else {
          return VariantService.loadVariants();
        }
      }]
    }, 
    data:{ 
      pageTitle: 'Collect Data',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'CollectDataCtrl', ['$scope', 'KpiService', 'ProcessService', '$modal', 'variants', function CollectDataCtrl( $scope, KpiService, ProcessService, $modal, variants ) {

  $scope.asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

  // $scope.moduleList = [];
  // console.log($scope.currentProcess);
  // _.each($scope.currentProcess.kpiList, function(kpi) {
  //   if(kpi.selectedModule) {
  //     $scope.moduleList.push({
  //       kpi: kpi, 
  //       module: kpi.selectedModule
  //     });
  //   }
  // });

  $scope.moduleInputIsOk = function(module) {
    return false;
  };

}]);

