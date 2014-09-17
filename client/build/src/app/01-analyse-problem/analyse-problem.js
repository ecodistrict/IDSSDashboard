angular.module( 'idss-dashboard.analyse-problem', [
  'idss-dashboard.analyse-problem.manage-kpis',
  'idss-dashboard.analyse-problem.use-kpi',
  'idss-dashboard.analyse-problem.configure-kpi',
  'idss-dashboard.analyse-problem.kpi-input'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'analyse-problem', {
    url: '/analyse-problem',
    views: {
      "main": {
        controller: 'AnalyseProblemCtrl',
        templateUrl: '01-analyse-problem/analyse-problem.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Analyse problem',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'AnalyseProblemCtrl', ['$scope', 'ProcessService', function AnalyseProblemCtrl( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  // watch for every change in process, just to set a flag if its changed so it will save itself on page change
  $scope.$watch('currentProcess', function(oldSettings, newSettings) {
    if(oldSettings !== newSettings) {
      console.log(oldSettings, newSettings);
      ProcessService.setIsModified(true);
    }
  }, true);

  $scope.layerOptions = [
    {name: "Road", label: "Road"},
    {name: "Aerial", label: "Aerial"},
    {name: "AerialWithLabels", label: "Aerial with labels"}
  ];

  $scope.layer = $scope.layerOptions[0].label;

  $scope.result = "";

}]);

