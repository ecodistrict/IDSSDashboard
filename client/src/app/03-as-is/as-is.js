angular.module( 'idss-dashboard.as-is', [
  // 'idss-dashboard.as-is.map',
  // 'idss-dashboard.as-is.details'
])

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

.controller( 'AsIsController', ['$scope', '$timeout', '$sce', 'socket', '$state', 'variants', 'ModuleService', '$modal', 'KpiService', 'VariantService', function AsIsController( $scope, $timeout, $sce, socket, $state, variants, ModuleService, $modal, KpiService, VariantService ) {

  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

  $scope.kpiOutputs = []; // TODO: there are different type of outputs; kpi value, map outputs, charts, lists. In different tabs. New structure of outputs needed? 
  $scope.kpiMapOutputs = [];

  var getBad = function(inputSpec) {
    if(inputSpec.kpiScores && inputSpec.kpiScores.inputs && inputSpec.kpiScores.inputs.kpiScoreBad) {
      return inputSpec.kpiScores.inputs.kpiScoreBad.value;
    }
  };

  var getExcellent = function(inputSpec) {
    if(inputSpec.kpiScores && inputSpec.kpiScores.inputs && inputSpec.kpiScores.inputs.kpiScoreExcellent) {
      return inputSpec.kpiScores.inputs.kpiScoreExcellent.value;
    }
  };

  _.each(asIsVariant.kpiList, function(kpi) {

    var bad = getBad(kpi.inputSpecification);
    var excellent = getExcellent(kpi.inputSpecification);
    var kpiOutput = {
      kpiName: kpi.name,
      kpiId: kpi.alias,
      kpiBad: bad,
      kpiExcellent: excellent, 
      inputSpecification: kpi.inputSpecification,
      kpiUnit: kpi.unit,
      moduleName: kpi.selectedModule.name,
      moduleId: kpi.selectedModule.id,
      qualitative: kpi.qualitative,
      status: 'loading',
      loading: true
    };

    // add the kpi outputs with loading status
    $scope.kpiOutputs.push(kpiOutput);

    var prepareKpiData = function(o) {
      o.kpiId = kpi.alias;
      o.kpiName = kpi.name;
      o.kpiBad = bad;
      o.kpiExcellent = excellent;
      o.kpiUnit = kpi.unit;
      o.moduleId = kpi.selectedModule.id;
    };

    if(!kpi.qualitative) {
    
      // fetch existing output from server
      ModuleService.getModuleOutput(asIsVariant._id, kpi.selectedModule.id, kpi.alias).then(function(output) {
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

        // set the kpi values on children outputs
        _.each(output.outputs, function(o) {
          prepareKpiData(o);
          if(o.type === 'geojson') {
            $scope.kpiMapOutputs.push(o);
          } 
        });

        console.log(output.outputs);

        kpiOutput.outputs = output.outputs; // listen on this to trigger rendering

      });

    } else {
      kpiOutput.outputs = KpiService.generateQualitativeKpiOutput(kpi.inputSpecification.kpiScores.inputs);
      kpiOutput.kpiBad = 1;
      kpiOutput.kpiExcellent = 10;
      kpiOutput.kpiUnit = 'score';
      kpiOutput.moduleName = 'qualitative KPI';
      kpiOutput.loading = false;
      if(kpiOutput.outputs) {
        kpiOutput.status = 'success';
      } else {
        kpiOutput.status = 'unprocessed';
      }

      console.log(kpiOutput);
    }
      
  });

  // listen on any model that was started, for updating loading status
  socket.on('startModel', function(module) {
      console.log('start model', module);
      
      var found = _.find($scope.kpiOutputs, function(kpiOutput) {
        return kpiOutput.moduleId === module.moduleId && kpiOutput.kpiId === module.kpiId;
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
      return kpi.kpiId === module.kpiId;
    });
    if(kpiOutput) {
      //kpiOutput.status = module.status;
      _.each(module.outputs, function(o) {
        o.kpiId = kpiOutput.kpiId;
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
      kpiId: kpiOutput.kpiId, 
      moduleId: kpiOutput.moduleId,
      status: kpiOutput.status
    });

  };

  $scope.stopCalculation = function(kpiOutput) {
    kpiOutput.status = 'unprocessed';
    kpiOutput.loading = false;

    ModuleService.updateModuleOutputStatus(asIsVariant._id, kpiOutput.moduleId, kpiOutput.kpiId, kpiOutput.status);

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

  $scope.setScore = function(kpi) {

    var kpiModal = $modal.open({
      templateUrl: 'qualitative-kpi-input/qualitative-kpi-input.tpl.html',
      controller: 'QualitativeKpiInputCtrl',
      resolve: {
        kpi: function() {
          return kpi;
        }
      }
    });

    kpiModal.result.then(function (configuredKpi) {
      // TODO: change all alias to kpiId
      configuredKpi.alias = configuredKpi.kpiId;
      // update kpi in variant
      VariantService.updateKpi(asIsVariant, configuredKpi);
      console.log(configuredKpi.outputs);
      kpi.outputs = configuredKpi.outputs;
    }, function () {
      console.log('Modal dismissed at: ' + new Date());
    });

  };

}]);

