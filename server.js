var express = require('express');
var http = require('http');
var _ = require('underscore'); 
var util = require('util');

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var port = process.env.PORT || 3300;

var imb = require('./lib/imb.js');

var imbName, imbConnection, imbFrameworkPub, imbFrameworkSub;

// *********** DB MODELS ******** //
require('./lib/models/user');
//require('./lib/models/process');
require('./lib/models/kpi');
require('./lib/models/variant');
require('./lib/models/case');
require('./lib/models/output');
require('./lib/models/kpiRecord');
var User = mongoose.model('User'); // needed for passport below

// *********** DB CONNECT ********* //
var distFolder;
var dbConnect = process.env.DB_CONN || 'mongodb://localhost:27017/idssdashboard';

if(process.env.NODE_ENV === 'production') {
  distFolder = path.resolve(__dirname, 'client/dist');
} else {
  distFolder = path.resolve(__dirname, 'client/build');
};

mongoose.connect(dbConnect);


// *********** CREATE APP *********** //

var app = module.exports = express();

var httpServer = http.createServer(app);

var io = require('socket.io').listen(httpServer, { log: false });

// ***** STATIC ******* //

var staticUrl = '/static';
app.use(staticUrl, express.static(distFolder));
app.use(staticUrl, express.static('./data'));
app.use('/export', express.static('./export'));
app.use(staticUrl, function(req, res, next) {
  res.send(404);
});

// middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
  limit: '20mb'
}));

app.use(session({ 
    cookie: {maxAge: 60000 * 60 * 24 * 30},
    secret: "session secret",
    saveUninitialized: true,
    resave: true,
    store: new MongoStore({
            db: mongoose.connection.db,
            auto_reconnect:true
    })
}));

// ********************** passport initialize (modularize some of this) *************************

app.use(passport.initialize());                             
app.use(passport.session());

passport.use(new LocalStrategy(
  function(email, password, done) {

    User.findOne({ email: email }, function (err, user) {
      if (err) { 
        return done(err); 
      } else if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      } else {
        user.comparePassword(password, function(err, isMatch) {
          if(isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Incorrect password.' });
          }
        });
      }
      
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.email);
});

passport.deserializeUser(function(email, done) {
  
  User.findOne({email:email}, function(err, user) {
    done(err, user);
  });

});

// ***** REST API **** //
var userRepository = require('./lib/user');
//var processRepository = require('./lib/process');
var caseRepository = require('./lib/case');
var kpiRepository = require('./lib/kpi');
var kpiRecordRepository = require('./lib/kpiRecord');
var variantRepository = require('./lib/variant');
//var moduleOutputRepository = require('./lib/moduleOutput');
var dataModule = require('./lib/dataModule');
//var importFile = require('./lib/import');
require('./lib/routes/user').addRoutes(app, userRepository, passport);
//require('./lib/routes/process').addRoutes(app, processRepository);
require('./lib/routes/cases').addRoutes(app, caseRepository);
require('./lib/routes/kpi').addRoutes(app, kpiRepository);
require('./lib/routes/kpiRecord').addRoutes(app, kpiRecordRepository);
require('./lib/routes/variant').addRoutes(app, variantRepository);
//require('./lib/routes/moduleOutput').addRoutes(app, moduleOutputRepository);
//require('./lib/routes/import').addRoutes(app, importFile);
require('./lib/routes/dataModule').addRoutes(app, dataModule);

// app.get('/selectModule/:moduleId/:kpiAlias/:processId', function(req, res) {
//   console.log(req.params);
//   var kpi = req.params;
//   if(kpi.moduleId) {
//       if(kpi.processId) {
//         var requestObj = { 
//           "type": "request",
//           "method": "selectModule",
//           "variantId": kpi.processId, 
//           "moduleId": kpi.moduleId, // this is called selectedModuleId in process kpi list
//           "kpiId": kpi.kpiAlias
//         };
//         imbFrameworkPub.signalString(JSON.stringify(requestObj).toString());
//         res.status(200).json({msg: 'Request for input specification was sent to module ' + kpi.moduleId + ' for KPI ' + kpi.kpiAlias});
//       } else {
//         res.status(200).json({msg: 'No process id for selecting module: ' + kpi.kpiAlias});
//       }
//   } else {
//     res.status(200).json({msg: 'No module id selected for kpi: ' + kpi.kpiAlias});
//   }
// });

app.all('/*', function(req, res) {
  res.sendfile('index.html', { root: distFolder });
});

// ****** IMB Connection ****** //

imbName;

if(process.env.NODE_ENV === 'production') {
  imbName = 'dashboard';
} else {
  imbName = 'dashboard-test';
};
imbConnection = new imb.TIMBConnection(imb.imbDefaultHostname, imb.imbDefaultTLSPort, 10, imbName, imb.imbDefaultPrefix, false, 
    "cert/client-eco-district.pfx", "&8dh48klosaxu90OKH", "cert/root-ca-imb.crt");

// imbConnection = new imb.TIMBConnection('cstb-temp', imb.imbDefaultTLSPort, 10, imbName, imb.imbDefaultPrefix, false, 
//     "cert/client-eco-district.pfx", "&8dh48klosaxu90OKH", "cert/root-ca-imb.crt");

imbFrameworkPub;
imbFrameworkSub;

if(process.env.NODE_ENV === 'production') {
  console.log('run in production');
  imbFrameworkPub = imbConnection.publish("modules");
  imbFrameworkSub = imbConnection.subscribe("dashboard");
} else {
  console.log('run in debug');
  imbFrameworkPub = imbConnection.publish("modulesTEST");
  imbFrameworkSub = imbConnection.subscribe("dashboardTEST");
};

imbConnection.on("onDisconnect", function (obj) {
  console.log("disconnected. kill process");
  process.exit();
});

io.sockets.on('connection', function(dashboardWebClientSocket) {

  console.log(dashboardWebClientSocket.id);

  dashboardWebClientSocket.on('error', function (err) { 
    console.error(err.stack);
  });

  dashboardWebClientSocket.on('privateRoom', function(user) {
    dashboardWebClientSocket.join(user._id);
  });

  dashboardWebClientSocket.on('getModules', function(kpiList) {
    var method = 'getModules';
    console.log('From dashboard client: ' + method);

    var requestObj = {
      "type": "request",
      "method": method,
      "parameters": {
        "kpiList": kpiList //Kpi list is not used, it's meant for getModules for certain KPIs, like query
      }
    }
    imbFrameworkPub.signalString(JSON.stringify(requestObj).toString());
  });

  // dashboardWebClientSocket.on('getCases', function(user) {

  //   console.log(user);

  //   var method = 'getCases';
  //   console.log('From dashboard client: ' + method);

  //   caseRepository.getCases(user._id, function(err, cases) {

  //     if(err) {
  //       console.log(err);
  //       return io.to(user._id).emit('dashboardError', {message: 'Could not get cases'});
  //     }

  //     console.log('sending cases to client: ' + user._id);

  //     io.to(user._id).emit('getCases', cases);

  //   });

  // });

  // dashboardWebClientSocket.on('getActiveCase', function(user) {

  //   var method = 'getActiveCase';
  //   console.log('From dashboard client: ' + method);

  //   caseRepository.getActiveCase(user._id, function(err, currentCase) {

  //     if(err) {
  //       console.log(err);
  //       return io.to(user._id).emit('dashboardError', {message: 'Could not get current case'});
  //     }

  //     io.to(user._id).emit('getActiveCase', currentCase);

  //   });

  // });

  // dashboardWebClientSocket.on('createCase', function(user) {
  //   var requestObj, 
  //       method = 'createCase';

  //   console.log('From dashboard client: ' + method);

  //   if(!user._id) {
  //     console.log('No user id was provided');
  //     return io.to(user._id).emit('dashboardError', {message: 'Internal error: User id is was not provided'});
  //   }

  //   caseRepository.createCase(user._id, function(err, caseData) {
  //     if(err) {
  //       console.log('error creating case: ', err);
  //       return io.to(user._id).emit('dashboardError', {message: 'Error creating case in dashboard'});
  //     }
  //     requestObj = {
  //       type: 'request',
  //       method: method,
  //       userId: user._id,
  //       caseId: caseData._id
  //     };
      
  //     imbFrameworkPub.signalString(JSON.stringify(requestObj).toString());
      
  //   });
    
  // });

  // dashboardWebClientSocket.on('deleteCase', function(caseData) {
  //   var requestObj, 
  //       method = 'deleteCase';

  //   console.log('From dashboard client: ' + method);

  //   if(caseData._id) {
  //     requestObj = {
  //       type: 'request',
  //       method: method,
  //       caseId: caseData._id,
  //     };
  //     imbFrameworkPub.signalString(JSON.stringify(requestObj).toString());
  //   } else {
  //     console.log('No case id sent');
  //   }
  // });

  dashboardWebClientSocket.on('startModule', function(module) {
    var method = 'startModule';
    console.log('From dashboard client: ' + method + ' data: ' + module);
    var requestObj = {
      "type": "request",
      "method": method,
      "userId": module.userId,
      "moduleId": module.moduleId,
      "caseId": module.caseId,
      "variantId": module.variantId,
      "kpiId": module.kpiAlias
    };
    imbFrameworkPub.signalString(JSON.stringify(requestObj).toString());
  });

  dashboardWebClientSocket.on('mcmsmv', function(module) {
    
    var method = 'mcmsmv';
    console.log('From dashboard client: ' + method + ' data: ' + module);
    var requestObj = {
      "type": "request",
      "method": method,
      "kpiId": module.kpiId,
      "inputs": module.variants,
      "userId": module.userId
    };
    imbFrameworkPub.signalString(JSON.stringify(requestObj).toString());
          
  });

  imbFrameworkSub.onString = function (aEventEntry, aString) {
    
    try {
      var message = JSON.parse(aString),
          method = message.method;

      console.log('From framework: ' + message.method);

      switch(method) {
        case 'getModules': 
          dashboardWebClientSocket.emit(message.method, message);
          break;
        case 'startModule':
          dashboardWebClientSocket.emit("frameworkActivity", JSON.stringify({message: 'Module ' + message.moduleId + ' sent ' + message.method}));
          io.to(message.userId).emit(message.method, message);
          break;
        case 'createCase': 
          if(message.status === 'success') {
            caseRepository.createCase(message.userId, function(err, caseData) {
              if(err) {
                console.log('error creating case: ', err);
                return io.to(err.userId).emit('dashboardError', JSON.stringify({message: 'Error creating case in dashboard'}));
              }
              io.to(message.userId).emit(message.method, message);
            });
          } else {
            io.to(message.userId).emit('frameworkError', {message: 'Process could not be created'});
          }
          break;
        case 'deleteCase':
          if(message.status === 'success') {
            caseRepository.deleteCase(message.caseId, message.userId, function(err, caseData) {
              if(err) {
                console.log('error deleting case: ', err);
                return io.to(err.userId).emit('dashboardError', JSON.stringify({message: 'Error deleting case in dashboard'}));
              }
              io.to(message.userId).emit(message.method, message);
            });
          } else {
            io.to(message.userId).emit('frameworkError', {message: 'Process could not be deleted'});
          }
          break;
        case 'mcmsmv':
          dashboardWebClientSocket.emit("frameworkActivity", JSON.stringify({message: 'Module ' + message.moduleId + ' sent ' + message.method}));
          io.to(message.userId).emit(message.method, message);
        default:
          console.log(method + ' is not a supported method for imb messages');
          break;
      }
      
    } catch(e) {
      console.log('Error when parsing the JSON string:');
      console.log(aString);
    }
  };

});

httpServer.listen(process.env.PORT || port);
console.log('Express started on port ' + port);
