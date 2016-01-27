angular.module( 'idss-dashboard.collect-data', [
  'idss-dashboard.collect-data.define-context',
  'idss-dashboard.collect-data.module-input',
  'idss-dashboard.collect-data.reset-input'
])

.config(['$stateProvider', function config( $stateProvider ) {
  $stateProvider.state( 'collect-data', {
    url: '/collect-data',
    views: {
      "main": {
        controller: 'CollectDataCtrl',
        templateUrl: '02-collect-data/collect-data.tpl.html'
      },
      "header": {
        controller: 'HeaderCtrl',
        templateUrl: 'header/header.tpl.html' 
      }
    },
    resolve:{
      currentCase: ['CaseService', function(CaseService) {
        var p = CaseService.getActiveCase();
        if(p._id) {
          return p;
        } else {
          return CaseService.loadActiveCase();
        }
      }],
      variants: ['VariantService', function(VariantService) {
        return VariantService.loadVariants().then(function(variants) {
          return variants;
        });
      }],
      currentUser: ['LoginService', function(LoginService) {
        return LoginService.getCurrentUser().then(function(user) {
          return user;
        });
      }]
    }, 
    data:{ 
      pageTitle: 'Collect Data',
      authorizedRoles: ['Facilitator']
    }
  });
}])

.controller( 'CollectDataCtrl', ['$scope', 'KpiService', 'CaseService', '$modal', 'currentCase', 'ModuleService', 'FileUploader', 'socket', 'variants', 'currentUser', 
  function CollectDataCtrl( $scope, KpiService, CaseService, $modal, currentCase, ModuleService, FileUploader, socket, variants, currentUser) {

  $scope.currentCase = currentCase;
  var asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});

  // upload is disabled 

  // var uploader = $scope.uploader = new FileUploader({
  //     url: 'import/geojson'
  // });

  // $scope.uploadFile = function(item) {
  //     item.upload();
  // };

  // uploader.onSuccessItem = function(item, response, status, headers) {
  //     console.info('Success');
  //     $scope.dataSource = response.data; // this triggers update in other directives that listens on input (geojson for ex)
  // };

  // uploader.onErrorItem = function(item, response, status, headers) {};

  // uploader.onCancelItem = function(item, response, status, headers) {};

  // TODO: create modal to upload files to process, this data is used for every module

  $scope.checkInputDataStatus = function(kpi) {
    console.log(kpi);
    kpi.status = 'connecting';
    kpi.loading = true;

    socket.emit('startModule', {
      caseId: currentCase._id,
      asIsVariantId: asIsVariant._id, // as is is needed if new alternative - if there is no input, take from as is
      kpiAlias: kpi.kpiAlias, 
      moduleId: kpi.selectedModuleId, 
      status: kpi.status,
      userId: currentUser._id, // if stakeholder id is sent in params, load data from stakeholder
      processId: currentCase._id
    });
  };  

  $scope.selectMap = function() {
    $scope.trig = !$scope.trig;
  };

  // listen on any module that was started, for updating loading status
  socket.on('startModule', function(module) {
    console.log('start module response', module);

    var kpi = _.find(currentCase.kpiList, function(k) {
      console.log(k);
      return k.selectedModuleId === module.moduleId;
    });

    console.log(kpi);

    if(kpi) {

      kpi.status = module.status;
      if(kpi.status !== 'processing') {
        kpi.loading = false;
      }
      kpi.info = module.info;

    }
      
  });

}]);

