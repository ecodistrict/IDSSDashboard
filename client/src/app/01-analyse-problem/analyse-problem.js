angular.module( 'idss-dashboard.analyse-problem', [
  'idss-dashboard.analyse-problem.manage-kpis',
  'idss-dashboard.analyse-problem.use-kpi',
  'idss-dashboard.analyse-problem.configure-kpi',
  'idss-dashboard.analyse-problem.add-kpi',
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
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'AnalyseProblemCtrl', ['$scope', 'ProcessService', function AnalyseProblemCtrl( $scope, ProcessService ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

  $scope.updateProcess = function(){
    ProcessService.saveCurrentProcess().then(function(process) {
      console.log(process);
    });
  };

  $scope.layerOptions = [
    {name: "Road", label: "Road"},
    {name: "Aerial", label: "Aerial"},
    {name: "AerialWithLabels", label: "Aerial with labels"}
  ];

  $scope.layer = $scope.layerOptions[0].label;

  $scope.result = "";

}]);

