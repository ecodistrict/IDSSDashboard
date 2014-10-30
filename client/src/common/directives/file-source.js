angular.module('idss-dashboard').directive('fileSource', ['FileUploader', 'ProcessService', '$templateCache', '$compile',function(FileUploader, ProcessService, $templateCache, $compile) {

    return {
        restrict: 'E',
        scope: {
            input: '='
        },
        link: function ( scope, element, attrs ) {

            var input = scope.input;

            var uploadUrl = scope.url;

            var uploader = scope.uploader = new FileUploader({
                url: 'import/geojson'
            });

            var template = $templateCache.get('directives/file-source.tpl.html');
            element.html('').append( $compile( template )( scope ) );

            console.log(uploader);

            if(input.source) {
                uploader.queue.push(input.source);
            }

            scope.uploadFile = function(item) {
                item.upload();
            };

            uploader.onSuccessItem = function(item, response, status, headers) {
                // TODO: add item formdata to input.sources array
                console.info('Success');
                input.value = response.data; // this needs to trigger update in other directives that listens on input (geojson for ex)
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

            };

            uploader.onErrorItem = function(item, response, status, headers) {};

            uploader.onCancelItem = function(item, response, status, headers) {};
        }
    };
}]);

