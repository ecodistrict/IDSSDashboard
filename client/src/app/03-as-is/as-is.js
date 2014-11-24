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

  $scope.kpiOutputs = []; // TODO: there are different type of outputs; kpi value, map outputs, charts, lists. In different tabs. New structure of outputs needed? 
  $scope.kpiMapOutputs = [];

  var getBad = function(inputs) {
    var kpiScores = _.find(inputs, function(input) {return input.id === 'kpi-scores';});
    if(kpiScores && kpiScores.inputs) {
      // assume order
      return kpiScores.inputs[1].value;
    }
  };

  var getExcellent = function(inputs) {
    var kpiScores = _.find(inputs, function(input) {return input.id === 'kpi-scores';});
    if(kpiScores && kpiScores.inputs) {
      // assume order
      return kpiScores.inputs[0].value;
    }
  };

  _.each(asIsVariant.kpiList, function(kpi) {

    var bad = getBad(kpi.inputs);
    var excellent = getExcellent(kpi.inputs);

    // add the kpi outputs with loading status
    $scope.kpiOutputs.push({
      kpiName: kpi.name,
      kpiAlias: kpi.alias,
      kpiBad: bad,
      kpiExcellent: excellent, 
      inputs: kpi.inputs,
      kpiUnit: kpi.unit,
      moduleName: kpi.selectedModule.name,
      moduleId: kpi.selectedModule.id,
      status: 'loading',
      loading: true
    });

    var prepareKpiData = function(o) {
      o.kpiAlias = kpi.alias;
      o.kpiName = kpi.name;
      o.kpiBad = bad;
      o.kpiExcellent = excellent;
      o.kpiUnit = kpi.unit;
      o.moduleId = kpi.selectedModule.id;
    };
    
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

      _.each(output.outputs, function(o) {
        prepareKpiData(o);
        if(o.type === 'geojson') {
          $scope.kpiMapOutputs.push(o);
        } 
      });

      kpiOutput.outputs = output.outputs; // listen on this to trigger rendering

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
      //kpiOutput.status = module.status;
      _.each(module.outputs, function(o) {
        o.kpiAlias = kpiOutput.kpiAlias;
        o.kpiName = kpiOutput.kpiName;
        o.kpiBad = kpiOutput.kpiBad;
        o.kpiExcellent = kpiOutput.kpiExcellent;
        o.kpiUnit = kpiOutput.kpiUnit;
        o.moduleId = kpiOutput.moduleId;
        if(o.type === 'geojson') {
          // TODO: update any existing map output, use id?
          $scope.kpiMapOutputs.push(o);
        }

      //    var existingOutput  = _.find(kpiOutput.outputs, function(kO) {return kO.id === o.id;});
      //    if(existingOutput) {
      //      console.log('output exists - update value');
      // //     // update value, look for type
      //    } else {
      //      console.log('output did not exist - create new output object');
      // //     // push value, look for type
      // //     if()
      // //     $scope.kpiMapOutputs.push(o);
      //    }
        
      });

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

    ModuleService.updateModuleOutputStatus(asIsVariant._id, kpiOutput.moduleId, kpiOutput.kpiAlias, kpiOutput.status);

    // send message to model?
  };

  $scope.calculateAllKpis = function() {

    _.each($scope.kpiOutputs, function(kpiOutput) {
      $scope.calculateKpi(kpiOutput);
    });

  };

  $scope.selectMap = function() {
    $scope.trig = true;
  };

  $scope.getStatus = function(kpi) {
    console.log(kpi.status);
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

}]);

