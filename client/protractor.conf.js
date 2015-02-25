exports.config = {
    specs: [
    	'test/e2e/create-new-account.e2e.js',
    	'test/e2e/logging-in.e2e.js',
        'test/e2e/check-modules-registered.e2e.js',
        'test/e2e/add-kpi-geojson.e2e.js',
        'test/e2e/use-kpi-geojson.e2e.js',
        'test/e2e/configure-kpi-geojson.e2e.js'
    ],
    baseUrl: 'http://localhost:3300',
    seleniumServerJar: 'node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar',
    chromeDriver: 'node_modules/protractor/selenium/chromedriver'
}