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
      if(statusMessages.length === 1) {
        statusMessages[0].loading = false;
        statusMessages.push({
          text: 'Connection to module failed after timeout of 10 seconds. Click reset to try again or contact module vendor.'
        });
      }
    }, 10000);

    ProcessService.resetModuleInput(kpi).then(function(response) {
      statusMessages[statusMessages.length-1].loading = false;
      statusMessages.push({
        text: response.msg
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