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

// *********** DB MODELS ******** //
require('./lib/models/user');
require('./lib/models/process');
require('./lib/models/kpi');
require('./lib/models/variant');
require('./lib/models/input');
require('./lib/models/output');
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

// ***** STATIC ******* //

var staticUrl = '/static';
app.use(staticUrl, express.static(distFolder));
app.use(staticUrl, express.static('./data'));
app.use('/export', express.static('./export'));
app.use(staticUrl, function(req, res, next) {
  res.send(404);
});

// ***** REST API **** //
var userRepository = require('./lib/user');
var processRepository = require('./lib/process');
var kpiRepository = require('./lib/kpi');
var variantRepository = require('./lib/variant');
var exportFile = require('./lib/export');
var importFile = require('./lib/import');
require('./lib/routes/user').addRoutes(app, userRepository, passport);
require('./lib/routes/process').addRoutes(app, processRepository);
require('./lib/routes/kpi').addRoutes(app, kpiRepository);
require('./lib/routes/variant').addRoutes(app, variantRepository);
require('./lib/routes/export').addRoutes(app, exportFile);
require('./lib/routes/import').addRoutes(app, importFile);

app.all('/*', function(req, res) {
  res.sendfile('index.html', { root: distFolder });
});

var imbConnection = new imb.TIMBConnection();
imbConnection.connect('vps17642.public.cloudvps.com', 4000, 1234, 'dashboard', 'ecodistrict');
//imbConnection.connect('192.168.23.1', 4000, 1234, 'dashboard', 'ecodistrict');

var SUBSCRIBE_EVENT;
var PUBLISH_EVENT;
if(process.env.NODE_ENV === 'production') {
  SUBSCRIBE_EVENT = 'dashboard';
  PUBLISH_EVENT = 'modules';
} else {
  SUBSCRIBE_EVENT = 'dashboardTEST';
  PUBLISH_EVENT = 'modulesTEST';
}
var imbFrameworkSocket = imbConnection.subscribe(SUBSCRIBE_EVENT, true);

var sendModuleRequest = function(requestObj) {
  var request = JSON.stringify(requestObj).toString();
  var message = imbConnection.publish(PUBLISH_EVENT, true);
  var messageByteLength = Buffer.byteLength(request);
  var eventPayload = new Buffer(4+messageByteLength);
  var offset = 0;
  eventPayload.writeInt32LE(messageByteLength, offset);
  offset += 4;
  eventPayload.write(request, offset);
  message.normalEvent(imb.ekNormalEvent, eventPayload);
};

io.sockets.on('connection', function(dashboardWebClientSocket) {

  console.log(dashboardWebClientSocket.id);

  dashboardWebClientSocket.on('privateRoom', function(data) {
    dashboardWebClientSocket.join(data.userId);
  });

  // get requests from client
  dashboardWebClientSocket.on('message', function(method){

    switch(method) {

      case 'test':

        break;

      default:

        console.log('client send was not handled');
    }

  });

  dashboardWebClientSocket.on('getModules', function(kpiList) {
    console.log('From dashboard client: ', kpiList);
    var method = 'getModules';
    var requestObj = {
      "type": "request",
      "method": method,
      "parameters": {
        "kpiList": kpiList
      }
    }
    sendModuleRequest(requestObj);
  });

  dashboardWebClientSocket.on('selectModel', function(kpi) {
    var method = 'selectModel';
    console.log('From dashboard client: ' + method + ', data: ' + kpi.selectedModule.id);
    if(kpi.selectedModule && kpi.selectedModule.id) {
      if(kpi.variantId) {
        var requestObj = { 
          "type": "request",
          "method": "selectModel",
          "variantId": kpi.variantId,
          "moduleId": kpi.selectedModule.id,
          "kpiId": kpi.alias
        };
        sendModuleRequest(requestObj);
      } else {
        console.log('no variant id for selecting module: ' + kpi.alias);
      }
    } else {
      console.log('no model selected for kpi: ' + kpi.alias);
    }
  });

  dashboardWebClientSocket.on('startModel', function(module) {
    variantRepository.getModuleInputFramework(module, userRepository, processRepository, function(err, moduleInput) {
      if(err) {
        dashboardWebClientSocket.emit("frameworkError", JSON.stringify(err));
      } else {
        variantRepository.saveModuleOutputStatus(module, function(err) {
          if(err) {
            dashboardWebClientSocket.emit("frameworkError", JSON.stringify(err));
          } else {
            var method = 'startModel';
            console.log('From dashboard client: ' + method + ' data: ' + module);
            var requestObj = {
              "type": "request",
              "method": method,
              "moduleId": moduleInput.moduleId,
              "variantId": moduleInput.variantId,
              "kpiId": moduleInput.kpiId,
              "inputs": moduleInput.inputs
            };
            sendModuleRequest(requestObj);
          }
        });
      }
    });
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
    sendModuleRequest(requestObj);
          
  });

  imbFrameworkSocket.onNormalEvent = function(eventDefinition, eventPayload) {
    var offset = 0;
    var length = eventPayload.readInt32LE(offset);
    offset += 4;
    var message = eventPayload.toString('utf8', offset, offset + length);
    message = JSON.parse(message);
    console.log('From framework: ' + message.method);
    if(message.method === 'getModules') {
      dashboardWebClientSocket.emit(message.method, message);
    } else if(message.method === 'selectModel') {
      dashboardWebClientSocket.emit("frameworkActivity", JSON.stringify({message: 'Module ' + message.moduleId + ' sent ' + message.method}));
      variantRepository.addModule(message, function(err, model) {
        if(err) {
          console.log(err.userId);
          io.to(err.userId).emit("frameworkError", JSON.stringify(err));
          //dashboardWebClientSocket.emit("frameworkError", JSON.stringify(err));
        } else {
          console.log(model.userId);
          io.to(model.userId).emit(message.method, model);
          //dashboardWebClientSocket.emit(message.method, model);
        }
      });
    } else if(message.method === 'startModel') {
      dashboardWebClientSocket.emit("frameworkActivity", JSON.stringify({message: 'Module ' + message.moduleId + ' sent ' + message.method}));
      variantRepository.saveModuleOutputStatus(message, function(err, success) {
        if(err) {
          io.to(err.userId).emit("frameworkError", JSON.stringify(err));
        } else {
          io.to(success.userId).emit(message.method, message);
        }
      });
      
    } else if(message.method === 'modelResult') {
      dashboardWebClientSocket.emit("frameworkActivity", JSON.stringify({message: 'Module ' + message.moduleId + ' sent ' + message.method}));
      variantRepository.addModuleResult(message, function(err, model) {
        if(err) {
          io.to(err.userId).emit("frameworkError", JSON.stringify(err));
        } else {
          //console.log(model);
          io.to(model.userId).emit(message.method, message);
        }
      });
    } else if(message.method === 'mcmsmv') {
      dashboardWebClientSocket.emit("frameworkActivity", JSON.stringify({message: 'Module ' + message.moduleId + ' sent ' + message.method}));
      io.to(message.userId).emit(message.method, message);
    }
  };

  imbFrameworkSocket.onChangeObject = function(action, objectId, evName, attr) {
    console.log(action, objectId, evName, attr);
  };

});

httpServer.listen(port);
console.log('Express started on port ' + port);
