exports.config = {
    specs: [
        // Basic setup
    	'test/energyscrum/create-user-and-login.e2e.js',
        'test/energyscrum/analyse-problem-overview.e2e.js',
        // KPIs
        'test/energyscrum/add-kpis.e2e.js',
        'test/energyscrum/use-kpis.e2e.js',
        'test/energyscrum/configure-kpis.e2e.js',
        'test/energyscrum/set-as-is.e2e.js',
        'test/energyscrum/set-to-be.e2e.js',
        // Variants
        'test/energyscrum/develop-alternative-1.e2e.js',
        'test/energyscrum/develop-alternative-2.e2e.js'
    ],
    baseUrl: 'http://localhost:3300',//'http://idssdashboard-env-mp3dbn2kwd.elasticbeanstalk.com',
    seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
    chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver'
}