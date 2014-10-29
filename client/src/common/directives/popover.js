angular.module('idss-dashboard').directive('popover', function(){
    return {
        restrict: 'A',
        link: function(scope, element, attrs){
            var options = {
                content: attrs.content,
                placement: attrs.placement
            };
            $(element).popover(options);
        }
    };
});