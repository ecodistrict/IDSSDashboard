var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Busboy = require('busboy');  
var StringDecoder = require('string_decoder').StringDecoder;  
var Process = mongoose.model('Process');
var Variant = mongoose.model('Variant');
var User = mongoose.model('User');

var doCreateProcess = function(userId, processData, cb) {

    User.findById(userId, function(err, user) {
        if(err) {
            cb(err);
        } else {
            processData.userId = userId;
            var newProcess = new Process(processData);

            newProcess.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    user.activeProcessId = newProcess._id;
                    user.save(function(err) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null, newProcess)
                        }
                    });
                }
            });

        }
    });
};

var process = {

    createProcess: function (req, res) {

        var newProcess;

        if (req.isAuthenticated()) {

            doCreateProcess(req.user._id, req.body, function(err, process) {

                if(err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(process);
                }

            });

        } else {
            res.json(401, {message: 'Not authenticated'});
        }
            
    },
    updateProcess: function (req, res) {

        var processId = req.body._id;
        if (req.isAuthenticated()) {

            Process.findOne({userId: req.user.id, _id: processId}, function(err, process) {
                if(err) {
                    res.json(500, err)
                } else if(!process) {
                    res.json(404, {message: "Process was not found"});
                } else {

                    if(req.body.title) {
                        process.title = req.body.title;
                    }
                    if(req.body.description) {
                        process.description = req.body.description;
                    }
                    if(req.body.district.mapSettings) {
                        process.district.mapSettings = req.body.district.mapSettings;
                    }
                    if(req.body.district.area) {
                        process.district.area = req.body.district.area;
                    }
                    if(req.body.district.geometry) {
                        process.district.geometry = req.body.district.geometry;
                    }
                    
                    //process.logs = req.body.logs; // do not save logs - the last log is not saved since logging occur on client after request

                    process.dateModified = new Date();
                    
                    process.save(function(err) {
                        if(err) {
                            res.json(500, err);
                        } else {
                            res.json(200, process);
                        }
                    });
                          
                }
            });
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    deleteProcess: function (req, res) {
        var processId;

        if (req.isAuthenticated()) {
            processId = req.params.processId || 'dummy id';
            Process.findOne({_id: processId, userId: req.user._id}, function(err, process) {
                if(err) {
                    res.status(500).json(err);
                } else if(!process) {
                    res.status(404).json({message: "Process not found or not authorized"});
                } else {
                    // delete all variants connected to this process
                    Variant.find({processId: process._id}).remove(function(err, variants) {
                        if(err) {
                            res.status(500).json(err);
                        } else {
                            process.remove(function (err) {
                                if (err) {
                                    res.status(500).json(err);
                                } else {
                                    res.status(200).json(process);
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getProcesses: function (req, res) {
        if (req.isAuthenticated()) {

            Process.find({userId: req.user._id}, function(err, processes) {
                if (err) {
                    res.json(500, err);
                } else {
                    res.json(200, processes);
                }
            });
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getProcess: function (req, res) {

        var processId = req.params.processId || 'dummy id';
        
        if (req.isAuthenticated()) {

            Process.findById(processId, function (err, process) {
                if (err) {
                    res.json(500, err);
                } else if(!process) {
                    res.json(404, {message: "Process not found"});
                } else {
                    res.json(200, process);
                }
            });
            
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getActiveProcess: function(req, res) {
        if (req.isAuthenticated()) {
            if(req.user.activeProcessId) {
                Process.findById(req.user.activeProcessId, function(err, process) {
                    if(err) {
                        res.json(500, err);
                    } else if(!process) {
                        
                        doCreateProcess(req.user._id, {}, function(err, process) {

                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json(process);
                            }

                        });
                        

                    } else {
                        res.status(200).json(process);
                    }
                });
            } else {
                res.status(404).json({message: "Process id not set"});
            }
        } else {
            res.status(401).json({msg: 'not authenticated'});
        }
    },
    uploadProcess: function(req, res) {

        if(req.isAuthenticated()) {

            var busboy = new Busboy({ headers: req.headers });

            busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
                // TODO: check file name and validate
                var decoder = new StringDecoder('utf8');
                var parsedData = '';

                file.on('data', function(data) {
                  var textChunk = decoder.write(data);
                  parsedData += textChunk;
                });

                file.on('end', function() {
                  
                    parsedData = JSON.parse(parsedData);

                    if(parsedData.process) {
                        delete parsedData.process._id;
                        
                        doCreateProcess(req.user._id, parsedData.process, function(err, process) {

                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json(process);
                            }

                        });
                    }
                });
            });
              
            req.pipe(busboy);

        } else {

            req.status(401).json({message: "Not authenticated"})

        }
        
    }
        
};
module.exports = process;