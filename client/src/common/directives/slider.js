angular.module('idss-dashboard').directive('slider', ['$compile', function($compile){
    return {
        restrict: 'E',
        replace: true,
        link: function(scope, element, attrs){
            console.log(attrs);

            var template = "<input id='" + 
                attrs.sliderId + "' data-slider-id='" + 
                attrs.sliderId + "Slider' type='text' data-slider-min='" + 
                attrs.sliderMin + "' data-slider-max='" + 
                attrs.sliderMax + "' data-slider-step='1' data-slider-value='" + 
                attrs.sliderValue + "'/>";

            element.html('').append( $compile( template )( scope ) );

            $('#'+ attrs.sliderId).slider({
                tooltip: 'always',
                formatter: function(value) {
                    return 'Priority: ' + value;
                }
            });
        }
    };
}]);