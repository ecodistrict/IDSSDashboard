angular.module('idss-dashboard')

.factory('ExportService', ['$http', function ($http, $location) {

    var downloadProcessAsEcodistFile = function (currentProcess) {
        return $http
            .get('/export/ecodist') 
            .then(function (res) {
                return res.data;
            });
    };
   
    return {
        downloadProcessAsEcodistFile: downloadProcessAsEcodistFile
    };
}]);