exports.config = {
    specs: [
        // Basic setup
    	'test/rotterdam/create-user-and-login.e2e.js',
        'test/rotterdam/analyse-problem-overview.e2e.js',
        // KPIs
        'test/rotterdam/add-kpis.e2e.js',
        'test/rotterdam/use-kpis.e2e.js',
        'test/rotterdam/configure-kpis.e2e.js',
        'test/rotterdam/set-as-is.e2e.js',
        'test/rotterdam/set-to-be.e2e.js',
        // Variants
        'test/rotterdam/develop-alternative-1.e2e.js',
        'test/rotterdam/develop-alternative-2.e2e.js',
        // Stakeholder Havensteder
        // 'test/rotterdam/havensteder-add-stakeholder.e2e.js',
        // 'test/rotterdam/havensteder-set-as-is.e2e.js',
        // 'test/rotterdam/havensteder-set-to-be.e2e.js',
        // 'test/rotterdam/havensteder-alternative-1.e2e.js',
        // 'test/rotterdam/havensteder-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/rotterdam/switch-to-facilitator.e2e.js',
        // // Stakeholder Residents
        // 'test/rotterdam/residents-add-stakeholder.e2e.js',
        // 'test/rotterdam/residents-set-as-is.e2e.js',
        // 'test/rotterdam/residents-set-to-be.e2e.js',
        // 'test/rotterdam/residents-alternative-1.e2e.js',
        // 'test/rotterdam/residents-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/rotterdam/switch-to-facilitator-2.e2e.js',
        // // Stakeholder Municipality
        // 'test/rotterdam/municipality-add-stakeholder.e2e.js',
        // 'test/rotterdam/municipality-set-as-is.e2e.js',
        // 'test/rotterdam/municipality-set-to-be.e2e.js',
        // 'test/rotterdam/municipality-alternative-1.e2e.js',
        // 'test/rotterdam/municipality-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/rotterdam/switch-to-facilitator-3.e2e.js',
        // // Stakeholder Residents
        // 'test/rotterdam/waterboard-add-stakeholder.e2e.js',
        // 'test/rotterdam/waterboard-set-as-is.e2e.js',
        // 'test/rotterdam/waterboard-set-to-be.e2e.js',
        // 'test/rotterdam/waterboard-alternative-1.e2e.js',
        // 'test/rotterdam/waterboard-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/rotterdam/switch-to-facilitator-4.e2e.js',
        // // Stakeholder Investor
        // 'test/rotterdam/investor-add-stakeholder.e2e.js',
        // 'test/rotterdam/investor-set-as-is.e2e.js',
        // 'test/rotterdam/investor-set-to-be.e2e.js',
        // 'test/rotterdam/investor-alternative-1.e2e.js',
        // 'test/rotterdam/investor-alternative-2.e2e.js'
    ],
    baseUrl: 'http://localhost:3300',//'http://idssdashboard-env-mp3dbn2kwd.elasticbeanstalk.com',
    seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
    chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver'
}