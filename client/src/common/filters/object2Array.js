angular.module('idss-dashboard').filter('object2Array', function() {
	return function(input) {
    	return _.toArray(input);
  	};
});