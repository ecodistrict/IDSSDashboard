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

    // add the kpi outputs with loading status
    $scope.kpiOutputs.push({
      kpiName: kpi.name,
      kpiAlias: kpi.alias,
      moduleName: kpi.selectedModule.name,
      moduleId: kpi.selectedModule.id,
      status: kpi.selectedModule.status,
      loading: true
    });
    
    // fetch existing output from server
    ModuleService.getModuleOutput(asIsVariant._id, kpi.selectedModule.id, kpi.alias).then(function(output) {
      var kpiOutput = _.find($scope.kpiOutputs, function(k) {return k.kpiAlias === kpi.alias;});
      kpiOutput.status =  output.status; 
      // 'success' (calculation ok and input not changed)
      // 'unprocessed' (input has changed, old output could be rendered)
      // 'initializing' (waiting for startModel response from model)
      // 'processing' (model is processing, waiting for model result)
      if(kpiOutput.status === 'initializing' || kpiOutput.status === 'processing') {
        kpiOutput.loading = true;
      } else {
        kpiOutput.loading = false;
      }
      kpiOutput.outputs = output.outputs; // listen on this to trigger rendering

      console.log(kpiOutput);
    });
      
  });

  // listen on any model that was started, for updating loading status
  socket.on('startModel', function(module) {
      console.log('start model', module);
      
      var found = _.find($scope.kpiOutputs, function(kpiOutput) {
        return kpiOutput.moduleId === module.moduleId && kpiOutput.kpiAlias === module.kpiAlias;
      });
      if(found) {
        found.status = module.status;
        if(found.status !== 'processing') {
          found.loading = false;
        }
      } else {
        console.log('This module is not used. Why would this happen?');
      }
  });

  socket.on('modelResult', function(module) {
    console.log('model result', module);

    var kpiOutput = _.find($scope.kpiOutputs, function(kpi) {
      return kpi.kpiAlias === module.kpiAlias;
    });
    if(kpiOutput) {
      kpiOutput.status = module.status;
      kpiOutput.outputs = module.outputs;
    } else {
      console.log('Dashboard recieved model result but couldnt find the kpi');
    }
      
    // But what if it is several results ex buildings coming one and one?

  });

  // TODO: when pushing calculate button on kpi, set status to calculating and save outputs status without outputs from modules.. how?
  $scope.calculateKpi = function(kpiOutput) {
    kpiOutput.status = 'initializing';
    kpiOutput.loading = true;

    socket.emit('startModel', {
      variantId: asIsVariant._id, 
      kpiAlias: kpiOutput.kpiAlias, 
      moduleId: kpiOutput.moduleId,
      status: kpiOutput.status
    });

  };

  $scope.stopCalculation = function(kpiOutput) {
    kpiOutput.status = 'unprocessed';
    kpiOutput.loading = false;

    // send message to model?
  };

  // since nvd3 options need functions and module config JSON does not allow functions
  // this function converts some settings to function for D3 
  // var prepareNvd3Options = function(options) {
  //   var chart = options.chart;
  //   if(!chart) {
  //     return;
  //   }
  //   if(chart.x && !_.isFunction(chart.x)) {
  //     chart.xOption = chart.x;
  //     chart.x = function(d) {
  //       if(!d) {
  //         return;
  //       }
  //       return d[chart.xOption];
  //     };
  //   }
  //   if(chart.y && !_.isFunction(chart.y)) {
  //     chart.yOption = chart.y;
  //     chart.y = function(d) {
  //       if(!d) {
  //         return;
  //       }
  //       return d[chart.yOption];
  //     };
  //   }
  //   if(chart.valueFormat && !_.isFunction(chart.valueFormat)) {
  //     chart.valueFormatOption = chart.valueFormat;
  //     chart.valueFormat = function(d) {
  //       if(!d) {
  //         return;
  //       }
  //       return d[chart.valueFormatOption];
  //     };
  //   }
  // };

  // set template urls to all outputs to generate corresponding directive
  // var setTemplateUrl = function(outputs) {
  //   if(!outputs) {return;}
  //   _.each(outputs, function(output) {
  //     output.template = 'directives/module-outputs/' + output.type + '.tpl.html';
  //     if(output.type === 'nvd3') {
  //       prepareNvd3Options(output.options);
  //     }
  //     if(output.outputs) {
  //       setTemplateUrl(output.outputs);
  //     }
  //   });
  // };

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

  $scope.getStatus = function(kpi) {
    if(kpi.status === 'unprocessed') {
      return 'warning';
    } else if(kpi.status === 'processing') {
      return 'info';
    } else if(kpi.status === 'success') {
      return 'success';
    }
  };

  // var modulesAreProcessing = function() {

  //   var processing = false;
  //   _.each($scope.currentProcess.kpiList, function(kpi) {
  //     if(kpi.selectedModule.isProcessing) {
  //       processing = true;
  //     }
  //   });
  //   return processing;
  // };

  //$scope.processing = modulesAreProcessing();

  // $timeout(function() {
  //   _.each($scope.currentProcess.kpiList, function(kpi) {
  //     var module = kpi.selectedModule;
  //     $scope.processing = modulesAreProcessing();
  //     setTemplateUrl(module.outputs);
  //     console.log(module);
  //   });
      
  // }, 1000);

  // All calculations needs an indicator to show calculation progress

  // The results are saved in the modules and shown in results
  

}]);

