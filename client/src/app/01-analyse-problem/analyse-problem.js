angular.module( 'idss-dashboard.analyse-problem', [
])

.config(function config( $stateProvider ) {
  $stateProvider.state( 'analyse-problem', {
    url: '/analyse-problem',
    views: {
      "main": {
        controller: 'AnalyseProblemCtrl',
        templateUrl: 'analyse-problem/analyse-problem.tpl.html'
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
})

.controller( 'AnalyseProblemCtrl', [function AnalyseProblemCtrl( $scope ) {
  

}]);

