var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Kpi = mongoose.model('Kpi');

var kpi = {

    createProcess: function (req, res) {

        var newProcess;

        if (req.isAuthenticated()) {

            newProcess = new Process(req.body);

            newProcess.save(function(err) {
                if(err) {
                    res.json(500, err);
                } else {
                    res.json(200, process);
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
                    
                    process.kpiListAsIs = req.body.kpiListAsIs;
                    process.kpiListToBe = req.body.kpiListToBe;
                    process.contextList = req.body.contextList;

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
        if (req.isAuthenticated()) {
            res.json(200, {message: 'Not implemented'});
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
                        res.json(404, {message: "Process not found"});
                    } else {
                        res.json(200, process);
                    }
                });
            } else {
                res.json(404, {message: "Process id not set"});
            }
        } else {
            res.json(401, {msg: 'not authenticated'});
        }
    }
        
};
module.exports = kpi;