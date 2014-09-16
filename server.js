/**
 * Module dependencies.
 */

var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');   
var _ = require('underscore');  
var Busboy = require('busboy');  
var StringDecoder = require('string_decoder').StringDecoder;  

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var hash = require('./pass').hash; // use this later for encryption?
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var disableAuthentication = true;

// ************* TEST VARIABLES 

var Process = {
  title: '',
  isModified: false,
  description: '',
  requiredContextVariables: [],
  district: {
    properties: {},
    area: null,
    geometry: []
  },
  kpiList: [],
  contextList: []
};

var tempUserDbId = 'id from database';
var user = {
  name: 'testuser',
  userId: 'id',
  id: tempUserDbId,
  userRole: 'facilitator',
  currentProcessId: 2
};

// Temporary process repo
var processRepo = {
  processes: [
    JSON.parse(fs.readFileSync(__dirname + '/data/processes/process1.ecodist').toString()),
    JSON.parse(fs.readFileSync(__dirname + '/data/processes/Test-modules.ecodist').toString())
  ],
  findById: function(id, cb) {
    var found = null;
    _.each(this.processes, function(process) {
      if(process.id === id) {
        found = process;
      }
    });
    cb(null, found);
  }
};

// global in memory store of current process - remove as soon as possible
// this is the process variable that progress is saved on when user tests the gui
var currentProcess = _.find(processRepo.processes, function(p) {
  return p.id === user.currentProcessId;
});

// Temporary Kpi repo
var kpiRepo = [
  {
    name: 'KPI 1',
    id: 'kpi1',
    description: 'Text module uses this KPI (The KPI normally dont know this..)',
    requiredContexts: ['context2']
  },{
    name: 'KPI 2',
    id: 'kpi2',
    description: 'Number module uses this KPI (The KPI normally dont know this..)',
    requiredContexts: ['context2']
  },{
    name: 'KPI 3',
    id: 'kpi3',
    description: 'File upload module uses this KPI (The KPI normally dont know this..)',
    requiredContexts: ['context2']
  }
];

var energyModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Energy.json').toString());
var noiseModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Noise.json').toString());
var textModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Text.json').toString());
var numbersModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Numbers.json').toString());
var uploadModule = JSON.parse(fs.readFileSync(__dirname + '/data/modules/module_Upload.json').toString());

var moduleRepo = [
  energyModule,
  noiseModule,
  textModule,
  numbersModule,
  uploadModule
];

var contextRepo = [
{
  name: 'Context 1',
  id: 'context1',
  inputs: [
    {
      label: 'Text input',
      type: 'text'
    }
  ]
},
{
  name: 'Context 2',
  id: 'context2',
  inputs: [
    {
      label: 'Text input',
      type: 'text'
    }
  ]
}];

// *************


// var options = {
//     key:    fs.readFileSync(__dirname + '/cert/server.key').toString(),
//     cert:   fs.readFileSync(__dirname + '/cert/server.crt').toString(),
//     ca:     fs.readFileSync(__dirname + '/cert/ca.crt').toString(),
//     requestCert:        true,
//     rejectUnauthorized: false,
//     passphrase: 'Enter a passphrase from env vars'
// };
  
// TODO: use mongo session store?
//var MongoStore = require('connect-mongo')(session);

var app = module.exports = express();

//var httpsServer = https.createServer(options, app);
var httpServer = http.createServer(app);

// middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({
  limit: '20mb'
}));

// TODO: use mongo session store?
// app.use(session({
//     cookie: { maxAge: 1000*60*2 } ,
//     secret: "session secret" ,
//     store: new MongoStore({
//             resave: false, 
//             saveUninitialized: false, 
//             db: 'vipenergy_test',
//             host: 'oceanic.mongohq.com',
//             port: 10079,  
//             username: 'test', 
//             password: 'test', 
//             collection: 'sessions', 
//             auto_reconnect:true
//     })
// }));

app.use(session({secret: 'secret'}));

// ********************** START passport initialize (modularize some of this) *************************

app.use(passport.initialize());                             
app.use(passport.session());

passport.use(new LocalStrategy(
  function(username, password, done) {

    if(username === 'ecodistrict' && password === 'ecodistrict') {
      return done(null, user);
    } else {
      return done(null, false, { message: 'Incorrect username or password' });
    }

    // TODO: use local db

    // User.findOne({ username: username }, function (err, user) {
    //   if (err) { return done(err); }
    //   if (!user) {
    //     return done(null, false, { message: 'Incorrect username.' });
    //   }
    //   if (!user.validPassword(password)) {
    //     return done(null, false, { message: 'Incorrect password.' });
    //   }
    //   return done(null, user);
    // });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  // find the user from database to put on req
  // TODO: use User mapping
  if(id === tempUserDbId) {
    done(null, user);
  } else {
    done(null. null);
  }
});

// TODO: Use shared login with dashboard database, initially mongodb
// this strategy example is from angular-app using MongoLab

// var MongoStrategy = require('./mongo-strategy');
 
// passport.use(new MongoStrategy(url, apiKey, dbName, authCollection));

// ************************ END passport initialize ********************

// TODO: this is example from express documentation - use hash this way?

// dummy database
// var users = {
//   tj: { name: 'tj' }
// };

// when you create a user, generate a salt
// and hash the password ('foobar' is the pass here)

// hash('foobar', function(err, salt, hash){
//   if (err) throw err;
//   // store the salt & hash in the "db"
//   users.tj.salt = salt;
//   users.tj.hash = hash;
// });

// function authenticate(name, pass, fn) {
//   if (!module.parent) console.log('authenticating %s:%s', name, pass);
//   var user = users[name];
//   // query the db for the given username
//   if (!user) return fn(new Error('cannot find user'));
//   // apply the same algorithm to the POSTed password, applying
//   // the hash against the pass / salt, if there is a match we
//   // found the user
//   hash(pass, user.salt, function(err, hash){
//     if (err) return fn(err);
//     if (hash == user.hash) return fn(null, user);
//     fn(new Error('invalid password'));
//   });
// }

var staticUrl = '/static';

if(process.env.NODE_ENV === 'production') {
  var distFolder = path.resolve(__dirname, './client/dist');
  app.use(staticUrl, express.static(distFolder));
} else {
  var distFolder = path.resolve(__dirname, './client/build');
  app.use(staticUrl, express.static(distFolder));
};

app.use(staticUrl, express.static('./data'));
app.use('/export', express.static('./export'));

//app.use(staticUrl, express.compress()); // not working in Express 4, use middleware
//app.use(staticUrl, express.static('.'));
app.use(staticUrl, function(req, res, next) {
  res.send(404);
});

var filterUser = function(user) {
  if ( user ) {
    return {
        name: user.name,
        userId: user.userId,
        id: user.id,
        userRole: user.userRole,
        currentProcessId: user.currentProcessId
    };
  } else {
    return null;
  }
};

app.post('/login', passport.authenticate('local'), function(req, res){
      res.send(200, filterUser(req.user));
});

app.get('/authenticated-user', function(req, res) {
  if (req.isAuthenticated() || disableAuthentication) {
    res.json(200, disableAuthentication ? filterUser(user) : filterUser(req.user));
  } else {
    res.json(401, {msg: 'not authenticated'});
  }
});

app.get('/logout', function(req, res){
  req.logout();
  res.send(204);
});

app.get('/process', function(req, res){
  if(req.isAuthenticated() || disableAuthentication) {
    // TODO: user req.user!!!
    if(user.currentProcessId){
      processRepo.findById(user.currentProcessId, function(err, currentProcess) {
        if(err) {
          res.status(500).json({message: "Internal Server Error"});
        } else if(!currentProcess) {
          res.status(404).json({message: "Process not found"});
        } else {
          res.status(200).json(currentProcess);
        }
      });

    } else {
      res.status(200).json({message: "No current process"});
    }
  } else {
    res.status(401).json({message: "Not authenticated"});
  }
});

app.post('/process', function(req, res){
  currentProcess = req.body;
  currentProcess.lastSaved = new Date();
  res.status(200).json(req.body);
});

app.post('/process/upload', function(req, res){

  var busboy = new Busboy({ headers: req.headers });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    // TODO: check file name and validate
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    var decoder = new StringDecoder('utf8');
    var parsedData = '';

    file.on('data', function(data) {
      var textChunk = decoder.write(data);
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      parsedData += textChunk;
    });

    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
      
      parsedData = JSON.parse(parsedData);

      // TODO: check if this is a valid process

      res.json(200, parsedData);
      
    });
  });
  
  req.pipe(busboy);

});

app.put('/process', function(req, res) {
  currentProcess = {};
  _.extend(currentProcess, Process);
  res.status(200).json(currentProcess);
});

app.get('/kpi', function(req, res){
  res.json(200, kpiRepo);
});

app.get('/module/kpi/:kpiId', function(req, res){
  var kpiId = req.param('kpiId');
  var foundList = _.filter(moduleRepo, function(module) {
    return _.find(module.useKpis, function(kpi) {
      return kpi === kpiId;
    });
  }); 
  res.json(200, foundList);
});

app.get('/module/:moduleId', function(req, res){
  var moduleId = req.param('moduleId');
  var found = _.find(moduleRepo, function(module) {
    return module.id === moduleId;
  }); 
  if(found) {
    res.json(200, found);
  } else {
    res.json(404);
  }
});

app.get('/module', function(req, res){

  res.json(200, moduleRepo);
  
});

app.get('/export/ecodist', function(req, res) {

  var currentProcessTitle = currentProcess.title || 'not named';

  // TODO: handle other types of strange strings
  currentProcessTitle = currentProcessTitle.split(' ').join('-'); 

  var outputFilename = './export/' + currentProcessTitle + '.ecodist';

  fs.writeFile(outputFilename, JSON.stringify(currentProcess, null, 4), function(err) {
      if(err) {
        res.json(500, err);
      } else {
        res.json(200, {title: currentProcessTitle});
      }
  });
});

app.get('/module', function(req, res){
  res.json(200, moduleRepo);
});

app.post('/module/import/:kpiId/:moduleId/:inputId', function(req, res) {

  // TODO: get kpi and module by user id

  var kpiId = req.param('kpiId');
  var moduleId = req.param('moduleId');
  var inputId = req.param('inputId');

  var module = _.find(currentProcess.kpiList, function(kpi) {
    if(kpi.id === kpiId) {
      return kpi.selectedModule; // TODO: kpi should have more than one possible module?
    } else {
      return false;
    }
  });

  console.log(currentProcess);
  console.log(module);

  var busboy = new Busboy({ headers: req.headers });

  var addInputDataToModule = function(inputs, data) {
    var found = false;
    _.each(module.inputs, function(input) {
      if(input.id === inputId) {
        input.value = data;
        found = true;
      }
      if(input.inputs && !found) {
        addInputDataToModule(input.inputs, data);
      }
    });
  };

  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    console.log('Field [' + fieldname + ']: value: ' + val);
    //
  });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    // TODO: check file name and validate
    console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    var decoder = new StringDecoder('utf8');
    var parsedData = '';

    file.on('data', function(data) {
      var textChunk = decoder.write(data);
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      parsedData += textChunk;
    });

    file.on('end', function() {
      console.log('File [' + fieldname + '] Finished');
      if(inputId) {
        // TODO: create this method on module object
        parsedData = JSON.parse(parsedData);
        addInputDataToModule(module.inputs, parsedData);
        res.json(200, {data: parsedData});

      } else {

        res.json(500, {error: "File upload was aborted due to an import problem with the data type"});

      }
      
    });
  });
  
  req.pipe(busboy);

});

app.get('/context', function(req, res){
  res.json(200, contextRepo);
});

app.get('/context/list', function(req, res){
  var contextIds = req.query.ids;
  console.log(JSON.parse(contextIds));
  res.json(200, contextRepo);
});

app.all('/*', function(req, res) {
  res.sendfile('index.html', { root: distFolder });
});

//httpsServer.listen(8443);
httpServer.listen(process.env.PORT || 3000);
console.log('Express started on port 3000');
