var express = require('express');
var http = require('http');
var _ = require('underscore');  

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var port = process.env.PORT || 3000;

var imb = require('./lib/imb.js');

// *********** DB MODELS ******** //
require('./lib/models/user');
require('./lib/models/process');
require('./lib/models/kpi');
require('./lib/models/variant');
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
            url: dbConnect,
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
imbConnection.connect('imb.lohman-solutions.com', 4000, 1234, 'dashboard', 'ecodistrict');

var imbFrameworkSocket = imbConnection.subscribe('dashboard', true);

var sendModelRequest = function(requestObj) {
  var request = JSON.stringify(requestObj).toString();
  var message = imbConnection.publish('models', true);
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

  // get requests from client
  dashboardWebClientSocket.on('message', function(method){

    switch(method) {

      case 'test':

        break;

      default:

        console.log('client send was not handled');
    }

  });

  dashboardWebClientSocket.on('getModels', function(kpiList) {
    console.log('From dashboard client: ', kpiList);
    var method = 'getModels';
    var requestObj = {
      "type": "request",
      "method": method,
      "parameters": {
        "kpiList": kpiList
      }
    }
    sendModelRequest(requestObj);
  });

  dashboardWebClientSocket.on('selectModel', function(kpi) {
    var method = 'selectModel';
    console.log('From client: ' + method + ', data: ' + kpi.selectedModule.id);
    if(kpi.selectedModule && kpi.selectedModule.id) {
      var requestObj = { 
        "type": "request",
        "method": "selectModel",
        "uid": kpi.uid,
        "id": kpi.selectedModule.id,
        "kpi": kpi.alias
      };
      sendModelRequest(requestObj);
    } else {
      console.log('no model selected for kpi: ' + kpi.alias);
    }
  });

  dashboardWebClientSocket.on('startModel', function(module) {
    var method = 'startModel';
    console.log('From client: ' + method + ' data: ' + module);
    var requestObj = {
      "type": "request",
      "method": method,
      "id": module.id,
      "parameters": {
        "inputs": module.inputs,
        "variantId": 123456 // TODO: create an id on every as-is and variant
       }
    };
    sendModelRequest(requestObj);
  });

  imbFrameworkSocket.onNormalEvent = function(eventDefinition, eventPayload) {
    var offset = 0;
    var length = eventPayload.readInt32LE(offset);
    offset += 4;
    var message = eventPayload.toString('utf8', offset, offset + length);
    message = JSON.parse(message);
    console.log('From framework: ' + message.method);
    if(message.method === 'getModels') {
      dashboardWebClientSocket.emit(message.method, message);
    } else if(message.method === 'selectModel') {
      variantRepository.addModel(message, function(err, model) {
        if(err) {
          dashboardWebClientSocket.emit("frameworkError", err);
        } else {
          dashboardWebClientSocket.emit(message.method, model);
        }
      });
    } else if(message.method === 'startModel') {
      dashboardWebClientSocket.emit(message.method, message);
    } else if(message.method === 'modelResult') {
      variantRepository.addModelResult(message, function(model) {
        dashboardWebClientSocket.emit(message.method, model);
      });
    }
  };

  imbFrameworkSocket.onChangeObject = function(action, objectId, evName, attr) {
    console.log(action, objectId, evName, attr);
  };

});

httpServer.listen(port);
console.log('Express started on port ' + port);
