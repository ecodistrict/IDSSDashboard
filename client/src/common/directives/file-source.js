angular.module('idss-dashboard').directive('fileSource', ['$fileUploader', 'ProcessService', function($fileUploader, ProcessService) {

    return {
        restrict: 'E',
        templateUrl: 'directives/file-source.tpl.html',
        scope: {
            input: '='
        },
        link: function ( scope, element, attrs ) {

            console.log(scope.$parent.module);

            var input = scope.input;
            var moduleId = scope.$parent.module.id;
            var kpiId = scope.$parent.kpiId;

            var uploadUrl = 'module/import/' + kpiId + '/' + moduleId + '/' + input.id;
            console.log(uploadUrl);

            var uploader = scope.uploader = $fileUploader.create({
                scope: scope, 
                url: uploadUrl
            });

            // this is used to trigger directive on file upload success
            scope.type = null;
            // to use in the file upload result directive
            scope.input = input;

            if(input.source) {
                uploader.queue.push(input.source);
            }

            scope.uploadFile = function(item) {
                console.log('uploading file with for input id: ' + input.id);
                item.formData = [{
                    inputType: input.type, 
                    inputId: input.id,
                    moduleId: moduleId
                }];
                item.upload();
            };

            uploader.bind('success', function (event, xhr, item, response) {
                // TODO: add item formdata to input.sources array
                console.info('Success', xhr, item, response);
                input.value = response.data;
                input.source = {
                    file:{
                        name: item.file.name,
                        path: item.file.path,
                        size: item.file.size,
                        lastModifiedDate: item.file.lastModifiedDate
                    },
                    formData: item.formData,
                    isCancel: item.isCancel,
                    isError: item.isError,
                    isReady: item.isReady,
                    isSuccess: item.isSuccess,
                    isUploaded: item.isUploaded,
                    progress: item.progress
                };
                ProcessService.setIsModified(true);
                // trigger directive for feedback on uploaded data
                scope.type = input.type; 
            });

            uploader.bind('cancel', function (event, xhr, item) {
                console.info('Cancel', xhr, item);
            });

            uploader.bind('error', function (event, xhr, item, response) {
                console.info('Error', xhr, item, response);
            });

        }
  };


}]);

