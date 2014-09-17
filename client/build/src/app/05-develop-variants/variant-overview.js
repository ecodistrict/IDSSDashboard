angular.module( 'idss-dashboard.develop-variants.variant-overview', [])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'variant-overview', {
    url: '/variant-overview',
    views: {
      "main": {
        controller: 'VariantOverviewCtrl',
        templateUrl: '05-develop-variants/variant-overview.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    data:{ 
      pageTitle: 'Variant overview',
      authorizedRoles: ['facilitator']
    }
  });
}])

.controller( 'VariantOverviewCtrl', ['$scope', '$timeout', 'ProcessService', '$modal', function VariantOverviewCtrl( $scope, $timeout, ProcessService, $modal ) {

  $scope.currentProcess = ProcessService.getCurrentProcess();

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

  _.each($scope.currentProcess.variants, function(variant) {
    variant.isProcessing = true;
    variant.status = 'default';
    setTemplateUrl(variant.alternative.outputs);
    $timeout(function() {
      variant.isProcessing = false;
      variant.status = 'success';
      $scope.processing = modulesAreProcessing();
    }, Math.floor(Math.random() * (3000 - 1000)) + 1000);
  });

  var modulesAreProcessing = function() {
    var processing = false;
    _.each($scope.currentProcess.variants, function(variant) {
      if(variant.isProcessing) {
        processing = true;
      }
    });
    return processing;
  };

  $scope.processing = modulesAreProcessing();

  $scope.removeVariant = function(variant) {
    ProcessService.removeVariant(variant);
  };

}]);

