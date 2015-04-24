var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var User = mongoose.model('User');
var Process = mongoose.model('Process');
var validator = require('validator');
var shortId = require('shortid');
var runMode = process.env.NODE_ENV;

var filterUser = function(user, sessionId) {
  if ( user ) {
    return {
        fname: user.fname,
        lname: user.lname,
        sessionId: sessionId,
        _id: user._id, 
        role: user.role,
        activeProcessId: user.activeProcessId
    };
  } else {
    return null;
  }
};

var user = {

    // Framework

    getUserById: function(userId, cb) {
        User.findOne({_id: userId}, function (err, user) {
            if (err) {
                cb(err);
            } else if(!user) {
                cb({message: "User not found"});
            } else {
                cb(null, filterUser(user));
            }
        });
    },

    // Dashboard

    login: function(req, res) {
        res.send(200, filterUser(req.user));
    },
    logout: function(req, res) {
        console.log(req.user);
        req.logout();
        res.send(204);
    },
    createUser: function (req, res) {
        var firstName = req.body.firstName,
            lastName = req.body.lastName,
            role = req.body.role,
            facilitatorId = req.body.facilitatorId,
            activeProcessId = req.body.activeProcessId,
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
                // rewrite password for test user
                if(runMode === 'test') {
                    password = 'testing';
                }
                user = new User({
                    dateCreated: Date.now(),
                    dateModified: Date.now(),
                    fname: firstName,
                    lname: lastName,
                    email: email,
                    password: password,
                    role: role,
                    facilitatorId: facilitatorId,
                    activeProcessId: activeProcessId,
                    active: false
                });
                // if a facilitator added this user, just save with reference to same process and do not create a new process
                if(facilitatorId && activeProcessId) {

                    user.save(function(err) {
                        if(err) {
                          res.json(500, err)
                        } else {
                            res.json(200, {
                                fname: user.fname, 
                                lname: user.lname, 
                                email: user.email, 
                                password: password
                            });
                        }
                    });

                // else a new process is created and referenced to the user
                } else {

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
    },
    getStakeholders: function(req, res) {
        if (req.isAuthenticated()) {
            User.find({facilitatorId: req.user._id}, function(err, stakeholders) {
                if(err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(stakeholders);
                }
            });
        } else {
            res.status(401).json({msg: 'not authenticated'});
        }
    }
        
};
module.exports = user;