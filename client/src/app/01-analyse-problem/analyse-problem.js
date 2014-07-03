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
    resolve: {
      projects: function(initService) {
        return initService.initProjects();
      }
    }
  });
})

.controller( 'AnalyseProblemCtrl', [function AnalyseProblemCtrl( $scope, titleService, projectService, userSettingsService, projects ) {
  titleService.setTitle( 'Open project' );

  console.log(projects);

  _.each(projects, function(p) {
        
          p.show = true;

      });

  $scope.projects = projects;
  $scope.activeProjectId = userSettingsService.getActiveProjectId();

  $scope.loadProject = function(project) {
    projectService.setProject(project);
  };

  $scope.deleteProject = function(project) {
    projectService.deleteProject(project._id).then(function(data){
      _.each($scope.projects, function(p) {
        // we dont have to remove it, just hide it
        if(p._id === data.projectId) {
          p.show = false;
        }
      });
    });
  };

  // TODO: not working - need tp remove projects when show = false
  $scope.$watch('projects', function(data) {
    console.log(data);
  }, true);

  // TODO: this is not working
  $scope.$watch('userSettingsService.getActiveProjectId()', function(id) {
    console.log(id);
  });

}]);

