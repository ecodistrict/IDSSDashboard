/**
 * Module dependencies.
 */

var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');   
var _ = require('underscore');      

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var hash = require('./pass').hash; // use this later for encryption?
var bodyParser = require('body-parser');
var path = require('path');
var session = require('express-session');
var disableAuthentication = true;

var options = {
    key:    fs.readFileSync(__dirname + '/cert/server.key').toString(),
    cert:   fs.readFileSync(__dirname + '/cert/server.crt').toString(),
    ca:     fs.readFileSync(__dirname + '/cert/ca.crt').toString(),
    requestCert:        true,
    rejectUnauthorized: false,
    passphrase: 'Enter a passphrase from env vars'
};

// TODO: use mongo session store?
//var MongoStore = require('connect-mongo')(session);

var app = module.exports = express();

//var httpsServer = https.createServer(options, app);
var httpServer = http.createServer(app);

// middleware

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

var tempUserDbId = 'id from database';
var user = {
  name: 'testuser',
  userId: 'id',
  id: tempUserDbId,
  userRole: 'facilitator'
};

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
var distFolder = path.resolve(__dirname, './client/build');

//app.use(staticUrl, express.compress()); // not working in Express 4
app.use(staticUrl, express.static(distFolder));
app.use(staticUrl, express.static('.'));
app.use(staticUrl, function(req, res, next) {
  res.send(404);
});

var filterUser = function(user) {
  if ( user ) {
    return {
        name: user.name,
        userId: user.userId,
        id: user.id,
        userRole: user.userRole
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

// global in memory store of current process - remove as soon as possible
var currentProcess;

app.post('/process', function(req, res){
  currentProcess = req.body;
  currentProcess.lastSaved = new Date();
  res.send(200, req.body);
});

var kpiRepo = [
  {
    name: 'KPI 1',
    id: 'kpi1',
    description: 'This is a description of KPI 1'
  },{
    name: 'KPI 2',
    id: 'kpi2',
    description: 'This is a description of KPI 2'
  },{
    name: 'KPI 3',
    id: 'kpi3',
    description: 'This is a description of KPI 3'
  }
];

app.get('/kpi', function(req, res){
  res.json(200, kpiRepo);
});

var moduleRepo = [
  {
    name: 'Module 1',
    id: 'module1',
    description: 'This is a description of Module 1',
    useKpis: ['kpi1']
  },{
    name: 'Module 2',
    id: 'module2',
    description: 'This is a description of Module 2',
    useKpis: ['kpi2']
  },{
    name: 'Module 3',
    id: 'module3',
    description: 'This is a description of Module 3',
    useKpis: ['kpi3']
  }
];

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

var currentProcess = {
  title: 'not saved yet'
};

app.get('/export/ecodist', function(req, res) {

  var currentProcessTitle = currentProcess.title || 'not named';

  // TODO: handle other types of strange strings
  currentProcessTitle = currentProcessTitle.split(' ').join('-'); 

  var outputFilename = './tmp/' + currentProcessTitle + '.ecodist';

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

app.all('/*', function(req, res) {
  res.sendfile('index.html', { root: distFolder });
});

//httpsServer.listen(8443);
httpServer.listen(process.env.PORT || 3000);
console.log('Express started on port 3000');
