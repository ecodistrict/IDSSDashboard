exports.config = {
    specs: [
        //basic setup
    	'test/rotterdam/create-new-account.e2e.js',
    	'test/rotterdam/logging-in.e2e.js',
        'test/rotterdam/analyse-problem-overview.e2e.js',
        //KPIs
        'test/rotterdam/add-kpis.e2e.js',
        'test/rotterdam/use-kpis.e2e.js',
        'test/rotterdam/configure-kpis.e2e.js',
        'test/rotterdam/set-as-is.e2e.js',
        'test/rotterdam/set-to-be.e2e.js',
        // //Variants
        'test/rotterdam/develop-alternative-1.e2e.js',
        'test/rotterdam/develop-alternative-2.e2e.js'
    ],
    baseUrl: 'http://localhost:3300',
    seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
    chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver'
}