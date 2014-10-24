angular.module('idss-dashboard').factory('NotificationService', ['flash', function(flash) {

    var createErrorFlash = function(msg) {

        flash.error = msg;
    };
    var createSuccessFlash = function(msg) {

        flash.success = msg;

    };
    var createWarnFlash = function(msg) {

        flash.warn = msg;

    };
    var createInfoFlash = function(msg) {

        flash.info = msg;

    };

    var createErrorStatus = function(msg) {

        flash.error = msg;
    };
    var createSuccessStatus = function(msg) {

        flash.success = msg;

    };
    var createWarnStatus = function(msg) {

        flash.warn = msg;

    };
    var createInfoStatus = function(msg) {

        flash.info = msg;

    };
    
    return {
        createErrorFlash: createErrorFlash,
        createSuccessFlash: createSuccessFlash,
        createWarnFlash: createWarnFlash,
        createInfoFlash: createInfoFlash,
        createErrorStatus: createErrorStatus,
        createSuccessStatus: createSuccessStatus,
        createWarnStatus: createWarnStatus,
        createInfoStatus: createInfoStatus
    };
}]);