exports.config = {
    specs: [
        //basic setup
    	'test/e2e/create-new-account.e2e.js',
    	'test/e2e/logging-in.e2e.js',
        'test/e2e/check-modules-registered.e2e.js',
        'test/e2e/analyse-problem-overview.e2e.js',
        //quantitative KPI
        'test/e2e/add-kpi-atomic.e2e.js',
        'test/e2e/use-kpi-atomic.e2e.js',
        'test/e2e/configure-kpi-atomic.e2e.js',
        'test/e2e/collect-data-atomic.e2e.js',
        'test/e2e/calculate-atomic.e2e.js',
        'test/e2e/set-ambition-atomic.e2e.js'
        // 'test/e2e/add-kpi-geojson.e2e.js',
        // 'test/e2e/use-kpi-geojson.e2e.js',
        // 'test/e2e/configure-kpi-geojson.e2e.js',
        //'test/e2e/collect-data-geojson.e2e.js',
        //'test/e2e/calculate-geojson'
        //'test/e2e/collect-data-atomic.e2e.js'
        //'test/e2e/calculate-atomic'
    ],
    baseUrl: 'http://localhost:3300',
    seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
    chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver'
}