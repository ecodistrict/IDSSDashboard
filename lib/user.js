var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var User = mongoose.model('User');
var Process = mongoose.model('Process');
var validator = require('validator');
var shortId = require('shortid');

var filterUser = function(user, sessionId) {
  if ( user ) {
    return {
        fname: user.fname,
        lname: user.lname,
        sessionId: sessionId,
        _id: user._id, 
        role: user.role,
        currentProcessId: user.currentProcessId
    };
  } else {
    return null;
  }
};

var user = {
    login: function(req, res) {
        res.send(200, filterUser(req.user));
    },
    logout: function(req, res) {
        req.logout();
        res.send(204);
    },
    createUser: function (req, res) {
        var firstName = req.body.firstName,
            lastName = req.body.lastName,
            role = req.body.role,
            email = req.body.email;

        if(firstName && lastName && role && validator.isEmail(email)) {
          User.findOne({email: email}, function(err, emailExist) {
            var user,
                process,
                password = shortId.generate();

            if(err) { 
              res.json(500, {message: err});
            } else if(emailExist) {
              res.json(400, {message: "User already exists"})
            } else {

                user = new User({
                    dateCreated: Date.now(),
                    dateModified: Date.now(),
                    fname: firstName,
                    lname: req.body.lastName,
                    email: req.body.email,
                    password: password,
                    role: role,
                    active: false
                });
                user.save(function(err) {
                    if(err) {
                      res.json(500, err)
                    } else {
                        
                        // create a new default process for the user - userId is required so we have to create the user first
                        process = new Process({userId: user._id});

                        process.save(function(err) {
                            if(err) {
                                res.json(500, {message: err});
                            } else {
                                // now set the new process id on user
                                user.activeProcessId = process._id;
                                // save again..
                                user.save(function(err) {

                                    if(err) {
                                        res.json(500, err)
                                    } else {
                                        // send the real password for now - later send to email address
                                        res.json(200, {
                                            fname: user.fname, 
                                            lname: user.lname, 
                                            email: user.email, 
                                            password: password
                                        });
                                    }


                                });
                                
                            }
                        });
                    }
                });
            }
          });
            
        } else {
            res.json(400, {message: 'input not valid'});
        }

            
    },
    updateUser: function (req, res) {
        if (req.isAuthenticated()) {
            User.findById(req.user._id, function(err, user) {
                if(err) {
                    res.json(500, err)
                } else if(!user) {
                    res.json(404, {message: "User was not found"});
                } else {

                    if(req.body.fname) {
                        user.fname = req.body.fname;
                    }
                    if(req.body.lname) {
                        user.lname = req.body.lname;
                    }
                    // if new password is provided
                    if(req.body.oldPassword && req.body.newPassword) {
                        // User needs to provide old password
                        user.comparePassword(req.body.oldPassword, function(err, isMatch) {
                          if(err) {
                            res.json(500, err);
                          } else if(!isMatch) {
                            res.json(404, {message: "Password not found"});
                          } else {
                            // user password IS encrypted in model before save - see model file
                            user.newPassword = req.body.newPassword;
                            user.save(function(err) {
                              if(err) {
                                res.json(500, err);
                              } else {
                                res.json(200, {message: "User settings was changed"});
                              }
                            });
                          }
                        });

                    } else {
                        // if no change of password - just save settings
                        user.save(function(err) {
                            if(err) {
                                res.json(500, err);
                            } else {
                                res.json(200, {message: "User settings was changed"});
                            }
                        });   
                    }
                    
                }
            });
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    deleteUser: function (req, res) {
        if (req.isAuthenticated()) {
            res.json(200, {message: 'Not implemented'});
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getUsers: function (req, res) {
        if (req.isAuthenticated()) {
            res.json(200, {message: 'Not implemented'});
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    // for user to get another user
    getUser: function (req, res) {

        var userId = req.params.userId || 'dummy id';
        
        if (req.isAuthenticated()) {

            User.findOne({_id: userId}, function (err, user) {
                if (err) {
                    res.json(500, err);
                } else if(!user) {
                    res.json(404, {message: "User not found"});
                } else {
                    res.json(200, filterUser(user));
                }
            });
            
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getAuthenticatedUser: function(req, res) {
        if (req.isAuthenticated()) {
            res.status(200).json(filterUser(req.user, req.sessionID));
        } else {
            res.status(401).json({msg: 'not authenticated'});
        }
    },
    getNewPassword: function(req, res) {
            
        if(validator.isEmail(req.params.email)) {
          User.findOne({email: req.params.email}, function(err, user) {
            var user,
                password = shortId.generate();

            if(err) { 
              res.status(500).json({message: err});
            } else if(!user) {
              res.status(400).json({message: "User does not exist"});
            } else {
              user.password = password;
              user.save(function(err, newUser) {
                if(err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({fname: user.fname, lname: user.lname, password: password});
                }
              });
            }
          });
            
        } else {
            res.status(400).json({message: 'input not valid'});
        }
    } 
        
};
module.exports = user;