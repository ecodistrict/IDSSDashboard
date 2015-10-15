angular.module( 'idss-dashboard.collect-data.reset-input', [])

.controller( 'ResetInputController', ['$scope', '$modalInstance', 'kpi', '$timeout', 'ProcessService', 'socket', function ResetInputController( $scope, $modalInstance, kpi, $timeout, ProcessService, socket ) {

  $scope.kpi = kpi;

  $scope.reset = function () {

    statusMessages = $scope.statusMessages = [];
    statusMessages.push({
      text: 'Connecting to module',
      loading: true
    });

    $timeout(function() {
      // after 10 seconds the messages should be more than two if success to connect to module
      if(statusMessages.length <= 2) {
        statusMessages[statusMessages.length-1].loading = false;
        statusMessages.push({
          text: 'Connection to module failed after timeout of 10 seconds. This indicates that the module is not currently running. Click reset to try again or contact module vendor.'
        });
      }
    }, 10000);

    ProcessService.resetModuleInput(kpi).then(function(response) {
      statusMessages[statusMessages.length-1].loading = false;
      statusMessages.push({
        text: response.msg,
        loading: true
      });
    });

    socket.on('selectModule', function(moduleInput) {
      statusMessages[statusMessages.length-1].loading = false;
      statusMessages.push({
        text: 'Module input was returned'
      });
      ProcessService.addModuleInputSpecification(moduleInput);
      ProcessService.loadProcess(kpi.processId).then(function(p) {
        statusMessages[statusMessages.length-1].loading = false;
        statusMessages.push({
          text: 'Module inputs saved: '
        });
        angular.forEach(p.kpiList, function(k) {
          if(k.kpiAlias === kpi.kpiAlias) {
            for(var spec in k.inputSpecification) {
              statusMessages.push({
                text: 'Key: ' + spec + ', type: ' + k.inputSpecification[spec].type
              });
            }
          }
        });
      });
    });

  };

  $scope.ok = function() {
    $modalInstance.close('message');
  };

}]);