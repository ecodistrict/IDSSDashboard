var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Busboy = require('busboy');  
var StringDecoder = require('string_decoder').StringDecoder;  
var Process = mongoose.model('Process');
var Variant = mongoose.model('Variant');
var KpiRecord = mongoose.model('KpiRecord');
var Output = mongoose.model('Output');
var User = mongoose.model('User');

var doCreateProcess = function(userId, processData, cb) {

    User.findById(userId, function(err, user) {
        if(err) {
            cb(err);
        } else {
            processData.userId = userId;
            processData.district = processData.district || {geometry: {}};
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

    // Framework

    getProcessById: function(processId, cb) {
        Process.findById(processId, function (err, process) {
            if (err) {
                cb(err);
            } else if(!process) {
                cb({message: "Process not found"});
            } else {
                cb(null, process);
            }
        });
    },

    addInputSpecification: function(moduleData, cb) {
        // make sure the process exists
        Process.findById(moduleData.processId, function(err, process) {
            var kpi;
            if(err) {
                err.userId = process.userId;
                cb(err);
            } else if(!process) {
                cb({message: "Process was not found", userId: process.userId});
            } else {
                kpi = _.find(process.kpiList, function(k) {return k.kpiAlias === moduleData.kpiId;});
                if(kpi) {
                    console.log('now add inputSpecification to kpiList in process');
                    kpi.inputSpecification = moduleData.inputSpecification;
                    moduleData.userId = process.userId;
                    process.markModified('kpiList');
                    process.save(function(err) {
                        if(err) {
                            cb({message: "Error when saving process", userId: process.userId});
                        } else {
                            cb(null, moduleData);
                        }
                    });
                } else {
                    cb({message: "KPI was not found", userId: process.userId});
                }
            }
        });
    },

    // Dashboard

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
                    if(req.body.district && req.body.district.geometry) {
                        process.district = req.body.district;
                        process.markModified('district');
                    }

                    if(req.body.kpiList) {
                        process.kpiList = req.body.kpiList;
                        // TODO check if any kpi is removed, in that case remove kpis in variants, inputs and outputs
                    }
                    
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
                    Variant.find({processId: process._id}, function(err, variants) {
                        if(err) {
                            res.status(500).json(err);
                        } else if(!variants) {
                            res.status(200).json(process);
                        } else {
                            var variantIds = _.pluck(variants, '_id');
                            KpiRecord.find({'variantId': {$in: variantIds}}).remove(function(err, records) {
                                if(err) {
                                    res.status(500).json(err);
                                } else {
                                    Output.find({'variantId': {$in: variantIds}}).remove(function(err, inputs) {
                                        if(err) {
                                            res.status(500).json(err);
                                        } else {
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