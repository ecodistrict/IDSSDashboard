angular.module( 'idss-dashboard.as-is', [
  // 'idss-dashboard.as-is.map',
  // 'idss-dashboard.as-is.details'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'as-is', {
    url: '/as-is/:startOnPageLoad',
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
      authorizedRoles: ['Facilitator']
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
    }
  });
}])

.controller( 'AsIsController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'variants', 'ModuleService', function AsIsController( $scope, $timeout, $sce, socket, $state, variants, ModuleService ) {

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

  $scope.kpiOutputs = [];

  _.each(asIsVariant.kpiList, function(kpi) {
    // load status/output of every output from kpi.selectedModule.id
  });

  // since nvd3 options need functions and module config JSON does not allow functions
  // this function converts some settings to function for D3 
  var prepareNvd3Options = function(options) {
    var chart = options.chart;
    if(!chart) {
      return;
    }
    if(chart.x && !_.isFunction(chart.x)) {
      chart.xOption = chart.x;
      chart.x = function(d) {
        if(!d) {
          return;
        }
        return d[chart.xOption];
      };
    }
    if(chart.y && !_.isFunction(chart.y)) {
      chart.yOption = chart.y;
      chart.y = function(d) {
        if(!d) {
          return;
        }
        return d[chart.yOption];
      };
    }
    if(chart.valueFormat && !_.isFunction(chart.valueFormat)) {
      chart.valueFormatOption = chart.valueFormat;
      chart.valueFormat = function(d) {
        if(!d) {
          return;
        }
        return d[chart.valueFormatOption];
      };
    }
  };

  // set template urls to all outputs to generate corresponding directive
  var setTemplateUrl = function(outputs) {
    if(!outputs) {return;}
    _.each(outputs, function(output) {
      output.template = 'directives/module-outputs/' + output.type + '.tpl.html';
      if(output.type === 'nvd3') {
        prepareNvd3Options(output.options);
      }
      if(output.outputs) {
        setTemplateUrl(output.outputs);
      }
    });
  };

  $scope.runModules = function() {

    _.each($scope.currentProcess.kpiList, function(kpi) {
      var module = kpi.selectedModule;
      module.isProcessing = true;
      module.status = 'default';
      socket.emit('startModel', module);
      // socket.on('startModel', function(module) {
      //   //module.outputs = outputs;
      //   console.log(module);
      //   //setTemplateUrl(module.outputs);
      // });
    });

  };

  var modulesAreProcessing = function() {

    var processing = false;
    _.each($scope.currentProcess.kpiList, function(kpi) {
      if(kpi.selectedModule.isProcessing) {
        processing = true;
      }
    });
    return processing;
  };

  $scope.processing = modulesAreProcessing();

  $timeout(function() {
    _.each($scope.currentProcess.kpiList, function(kpi) {
      var module = kpi.selectedModule;
      $scope.processing = modulesAreProcessing();
      setTemplateUrl(module.outputs);
      console.log(module);
    });
      
  }, 1000);

  // All calculations needs an indicator to show calculation progress

  // The results are saved in the modules and shown in results
  

}]);

