exports.config = {
    specs: [
        // Basic setup
    	'test/waterscrum/create-user-and-login.e2e.js',
        'test/waterscrum/analyse-problem-overview.e2e.js',
        // KPIs
        'test/waterscrum/add-kpis.e2e.js',
        'test/waterscrum/use-kpis.e2e.js',
        'test/waterscrum/configure-kpis.e2e.js',
        'test/waterscrum/set-as-is.e2e.js',
        'test/waterscrum/set-to-be.e2e.js',
        // Variants
        'test/waterscrum/develop-alternative-1.e2e.js',
        'test/waterscrum/develop-alternative-2.e2e.js',
        // Stakeholder Havensteder
        // 'test/waterscrum/havensteder-add-stakeholder.e2e.js',
        // 'test/waterscrum/havensteder-set-as-is.e2e.js',
        // 'test/waterscrum/havensteder-set-to-be.e2e.js',
        // 'test/waterscrum/havensteder-alternative-1.e2e.js',
        // 'test/waterscrum/havensteder-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/waterscrum/switch-to-facilitator.e2e.js',
        // // Stakeholder Residents
        // 'test/waterscrum/residents-add-stakeholder.e2e.js',
        // 'test/waterscrum/residents-set-as-is.e2e.js',
        // 'test/waterscrum/residents-set-to-be.e2e.js',
        // 'test/waterscrum/residents-alternative-1.e2e.js',
        // 'test/waterscrum/residents-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/waterscrum/switch-to-facilitator-2.e2e.js',
        // // Stakeholder Municipality
        // 'test/waterscrum/municipality-add-stakeholder.e2e.js',
        // 'test/waterscrum/municipality-set-as-is.e2e.js',
        // 'test/waterscrum/municipality-set-to-be.e2e.js',
        // 'test/waterscrum/municipality-alternative-1.e2e.js',
        // 'test/waterscrum/municipality-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/waterscrum/switch-to-facilitator-3.e2e.js',
        // // Stakeholder Residents
        // 'test/waterscrum/waterboard-add-stakeholder.e2e.js',
        // 'test/waterscrum/waterboard-set-as-is.e2e.js',
        // 'test/waterscrum/waterboard-set-to-be.e2e.js',
        // 'test/waterscrum/waterboard-alternative-1.e2e.js',
        // 'test/waterscrum/waterboard-alternative-2.e2e.js',
        // // Back to facilitator
        // 'test/waterscrum/switch-to-facilitator-4.e2e.js',
        // // Stakeholder Investor
        // 'test/waterscrum/investor-add-stakeholder.e2e.js',
        // 'test/waterscrum/investor-set-as-is.e2e.js',
        // 'test/waterscrum/investor-set-to-be.e2e.js',
        // 'test/waterscrum/investor-alternative-1.e2e.js',
        // 'test/waterscrum/investor-alternative-2.e2e.js'
    ],
    baseUrl: 'http://localhost:3300',//'http://idssdashboard-env-mp3dbn2kwd.elasticbeanstalk.com',
    seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.45.0.jar',
    chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver'
}