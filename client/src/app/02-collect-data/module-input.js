angular.module( 'idss-dashboard.collect-data.module-input', [])

.controller( 'ModuleInputController', ['$scope', '$modalInstance', 'kpi', 'ModuleService', 'VariantService', 'currentVariant', 'asIsVariant', 'ProcessService', function ModuleInputController( $scope, $modalInstance, kpi, ModuleService, VariantService, currentVariant, asIsVariant, ProcessService ) {

  $scope.kpi = kpi;

  var extendInputSpecification = function(inputSpecification, input) {
    for (var property in inputSpecification) {
      if(input && input[property]) {
        // if value exist - set to input specification
        if(input[property].value) {
          inputSpecification[property].value = input[property].value;
        }
        // if inputGroup call recursively
        if(inputSpecification[property].type === 'inputGroup') {
          extendInputSpecification(inputSpecification[property].inputs, input[property].inputs);
        }
      }
    }
  };

  console.log(kpi);

  if(kpi.selectedModuleId && kpi.inputSpecification) {

    $scope.message = "Loading input";
    $scope.loading = true;

    // get existing input and set the old values on the original input specifiction
    // the input specification is sent as input to the modules, as originally designed
    // for a coming version only inputs could be sent to modules and not the specification itselfp
    ModuleService.getModuleInput(currentVariant._id, kpi.selectedModuleId, kpi.alias, asIsVariant._id).then(function(kpiRecord) {
      
      if(kpiRecord.inputs) {
        extendInputSpecification(kpi.inputSpecification, kpiRecord.inputs);
      }
      
      $scope.message = '';
      $scope.loading = false;
    });
  } else {
    $scope.message = "No input is specified";
  }

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

  $scope.ok = function() {
    var moduleInput = null;
    if(kpi.selectedModuleId && kpi.inputSpecification) {
      moduleInput = {
        kpiAlias: kpi.alias,
        moduleId: kpi.selectedModuleId,
        variantId: kpi.variantId,
        inputs: kpi.inputSpecification
      };
    }
    $modalInstance.close(moduleInput);
  };

}]);