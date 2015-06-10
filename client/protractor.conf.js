exports.config = {
    specs: [
        //basic setup
    	'test/e2e/create-user-and-login.e2e.js',
        'test/e2e/check-modules-registered.e2e.js',
        'test/e2e/analyse-problem-overview.e2e.js',
        //quantitative KPI
        'test/e2e/add-test-kpi.e2e.js',
        'test/e2e/use-test-kpi.e2e.js',
        'test/e2e/configure-test-kpi.e2e.js',
        'test/e2e/collect-data.e2e.js',
        'test/e2e/calculate.e2e.js',
        'test/e2e/set-ambition.e2e.js',
        'test/e2e/develop-first-variant.e2e.js',
        //qualitative KPI
        'test/e2e/add-kpi-qualitative.e2e.js',
        'test/e2e/use-kpi-qualitative.e2e.js',
        'test/e2e/configure-kpi-qualitative.e2e.js'
        // 'test/e2e/set-as-is-qualitative.e2e.js',
        // 'test/e2e/set-ambition-qualitative.e2e.js',
        // 'test/e2e/develop-second-variant.e2e.js'

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