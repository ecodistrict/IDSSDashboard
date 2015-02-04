module.exports = function(config) {
  'use strict';

  config.set({
    autoWatch: false,
    basePath: '',
    frameworks: ['jasmine'],
    files: [
        'vendor/jquery/dist/jquery.js', // from here app dependencies
        'vendor/angular/angular.js',
        'vendor/angular-socket-io/socket.js',
        'vendor/underscore/underscore.js',
        'vendor/angular-http-auth/src/http-auth-interceptor.js',
        'vendor/bootstrap/dist/js/bootstrap.js',
        'vendor/angular-bootstrap/ui-bootstrap-tpls.js',
        'vendor/angular-ui-router/release/angular-ui-router.js',
        'vendor/angular-file-upload/angular-file-upload.js',
        'vendor/d3/d3.js',
        'vendor/nvd3/nv.d3.js',
        'vendor/angularjs-nvd3-directives/dist/angularjs-nvd3-directives.js',
        'vendor/angular-flash/dist/angular-flash.js',
        'build/templates-app.js',
        'build/templates-common.js',
        'build/src/**/*.js',// specs are not moved here
        'vendor/angular-mocks/angular-mocks.js', // from here test related
        'vendor/angular-socket.io-mock/angular-socket.io-mock.js',
        'src/**/*.spec.js'
    ],
    exclude: [],
    port: 8080,
    browsers: [
      'PhantomJS'
    ],
    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine'
    ],
    singleRun: false,
    colors: true,
  });
};