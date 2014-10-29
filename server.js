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
require('./lib/routes/user').addRoutes(app, userRepository, passport);
require('./lib/routes/process').addRoutes(app, processRepository);
require('./lib/routes/kpi').addRoutes(app, kpiRepository);
require('./lib/routes/variant').addRoutes(app, variantRepository);
require('./lib/routes/export').addRoutes(app, exportFile);

// ************* TEST VARIABLES 

// var Process = {
//   title: '',
//   isModified: false,
//   description: '',
//   requiredContextVariables: [],
//   district: {
//     properties: {},
//     area: null,
//     geometry: []
//   },
//   kpiList: [],
//   contextList: []
// };

// var tempUserDbId = 'id from database';
// var user = {
//   name: 'testuser',
//   userId: 'id',
//   id: tempUserDbId,
//   userRole: 'facilitator',
//   currentProcessId: null
// };

// // Temporary process repo
// var processRepo = {
//   processes: [
//     JSON.parse(fs.readFileSync(__dirname + '/data/processes/process1.ecodist').toString()),
//     JSON.parse(fs.readFileSync(__dirname + '/data/processes/Test-modules.ecodist').toString())
//   ],
//   findById: function(id, cb) {
//     var found = null;
//     _.each(this.processes, function(process) {
//       if(process.id === id) {
//         found = process;
//       }
//     });
//     cb(null, found);
//   }
// };

// global in memory store of current process - remove as soon as possible
// this is the process variable that progress is saved on when user tests the gui
// var currentProcess = _.find(processRepo.processes, function(p) {
//   return p.id === user.currentProcessId;
// });
// if(!currentProcess) {
//   currentProcess = {};
//   _.extend(currentProcess, Process);
// }

// // Temporary Kpi repo
// var kpiRepo = [
//   {
//     name: 'KPI 1',
//     id: 'kpi1',
//     description: 'Text module uses this KPI (The KPI normally dont know this..)',
//     requiredContexts: ['context2']
//   },{
//     name: 'KPI 2',
//     id: 'kpi2',
//     description: 'Number module uses this KPI (The KPI normally dont know this..)',
//     requiredContexts: ['context2']
//   },{
//     name: 'KPI 3',
//     id: 'kpi3',
//     description: 'File upload module uses this KPI (The KPI normally dont know this..)',
//     requiredContexts: ['context2']
//   },{
//     name: '3',
//     id: 'kpi4',
//     description: 'Energy Consumption',
//     requiredContexts: []
//   }
// ];

// var energyModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Energy.json').toString());
// var noiseModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Noise.json').toString());
// var textModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Text.json').toString());
// var numbersModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Numbers.json').toString());
// var uploadModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Upload.json').toString());

// var moduleRepo = [
//   // energyModule,
//   // noiseModule,
//   textModule,
//   numbersModule,
//   uploadModule
// ];

// var contextRepo = [
// {
//   name: 'Context 1',
//   id: 'context1',
//   inputs: [
//     {
//       label: 'Text input',
//       type: 'text'
//     }
//   ]
// },
// {
//   name: 'Context 2',
//   id: 'context2',
//   inputs: [
//     {
//       label: 'Text input',
//       type: 'text'
//     }
//   ]
// }];

// var test3dData = JSON.parse(fs.readFileSync(__dirname + '/data/truite.json').toString());


// app.get('/logout', function(req, res){
//   req.logout();
//   currentProcess = {};
//   _.extend(currentProcess, Process);
//   res.send(204);
// });

// app.get('/process', function(req, res){

//   var currentProcessId;

//   if(req.isAuthenticated()) {

//     currentProcessId = req.user.currentProcessId || 'dummy id';

//     processRepo.findById(req.user.currentProcessId, function(err, currentProcess) {
//       if(err) {
//         res.status(500).json({message: "Internal Server Error"});
//       } else if(!currentProcess) {
//         res.status(404).json({message: "Process not found"});
//       } else {
//         res.status(200).json(currentProcess);
//       }
//     });

//   } else {

//     res.status(401).json({message: "Not authenticated"});

//   }

// });

// app.post('/process', function(req, res){
//   currentProcess = req.body;
//   currentProcess.lastSaved = new Date();
//   res.status(200).json(req.body);
// });

// app.post('/process/upload', function(req, res){

//   var busboy = new Busboy({ headers: req.headers });

//   busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//     // TODO: check file name and validate
//     console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
//     var decoder = new StringDecoder('utf8');
//     var parsedData = '';

//     file.on('data', function(data) {
//       var textChunk = decoder.write(data);
//       console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
//       parsedData += textChunk;
//     });

//     file.on('end', function() {
//       console.log('File [' + fieldname + '] Finished');
      
//       parsedData = JSON.parse(parsedData);

//       // TODO: check if this is a valid process

//       currentProcess = parsedData.process;

//       res.json(200, parsedData.process);
      
//     });
//   });
  
//   req.pipe(busboy);

// });

// app.put('/process', function(req, res) {
//   currentProcess = {};
//   _.extend(currentProcess, Process);
//   res.status(200).json(currentProcess);
// });

// app.get('/kpi', function(req, res){
//   res.json(200, kpiRepo);
// });

// app.get('/module/kpi/:kpiId', function(req, res){
//   var kpiId = req.param('kpiId');
//   var foundList = _.filter(moduleRepo, function(module) {
//     return _.find(module.useKpis, function(kpi) {
//       return kpi === kpiId;
//     });
//   }); 
//   res.json(200, foundList);
// });

// app.get('/module/:moduleId', function(req, res){
//   var moduleId = req.param('moduleId');
//   var found = _.find(moduleRepo, function(module) {
//     return module.id === moduleId;
//   }); 
//   if(found) {
//     res.json(200, found);
//   } else {
//     res.json(404);
//   }
// });

// app.get('/module', function(req, res){

//   res.json(200, moduleRepo);
  
// });

// app.get('/module', function(req, res){
//   res.json(200, moduleRepo);
// });

// app.post('/module/import/:kpiId/:moduleId/:inputId', function(req, res) {

//   // TODO: get kpi and module by user id

//   var kpiId = req.param('kpiId');
//   var moduleId = req.param('moduleId');
//   var inputId = req.param('inputId');

//   var module = _.find(currentProcess.kpiList, function(kpi) {
//     if(kpi.id === kpiId) {
//       return kpi.selectedModule; // TODO: kpi should have more than one possible module?
//     } else {
//       return false;
//     }
//   });

//   console.log(currentProcess);
//   console.log(module);

//   var busboy = new Busboy({ headers: req.headers });

//   var addInputDataToModule = function(inputs, data) {
//     var found = false;
//     _.each(module.inputs, function(input) {
//       if(input.id === inputId) {
//         input.value = data;
//         found = true;
//       }
//       if(input.inputs && !found) {
//         addInputDataToModule(input.inputs, data);
//       }
//     });
//   };

//   busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
//     console.log('Field [' + fieldname + ']: value: ' + val);
//     //
//   });

//   busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
//     // TODO: check file name and validate
//     console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
//     var decoder = new StringDecoder('utf8');
//     var parsedData = '';

//     file.on('data', function(data) {
//       var textChunk = decoder.write(data);
//       console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
//       parsedData += textChunk;
//     });

//     file.on('end', function() {
//       console.log('File [' + fieldname + '] Finished');
//       if(inputId) {
//         // TODO: create this method on module object
//         parsedData = JSON.parse(parsedData);
//         addInputDataToModule(module.inputs, parsedData);
//         res.json(200, {data: parsedData});

//       } else {

//         res.json(500, {error: "File upload was aborted due to an import problem with the data type"});

//       }
      
//     });
//   });
  
//   req.pipe(busboy);

// });

// app.get('/context', function(req, res){
//   res.json(200, contextRepo);
// });

// app.get('/context/list', function(req, res){
//   var contextIds = req.query.ids;
//   console.log(JSON.parse(contextIds));
//   res.json(200, contextRepo);
// });

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
  // dashboardWebClientSocket.on('message', function(method){

  //   switch(method) {
  //     case 'getModels':
  //       var requestObj = {
  //         "type": "request",
  //         "method": method,
  //         "parameters": {
  //           "kpiList": [{
  //             "kpi": "01a333d2-b29c-42ee-9ae7-1a0195dc493c"
  //           }]
  //           }
  //         }

  //       break;
  //   }

  //   console.log(data);

  //   if(data === 'get3dData') {

  //     dashboardWebClientSocket.emit('3dData', test3dData);

  //   } else if (data === 'getModules') {

      
  //     //message.onHandleEvent(function{});
  //     //imb.signalChangeObject(imbConn.dashboardWebClientSocket, messageId, aAction, aObjectID, aAttribute);

  //   }

  // });

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
