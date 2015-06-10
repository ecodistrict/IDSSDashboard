var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var KpiRecord = mongoose.model('KpiRecord');
var Process = mongoose.model('Process');
var Variant = mongoose.model('Variant');
var User = mongoose.model('User');
var proj4 = require('proj4');

var toMercatorProj = proj4("EPSG:3857");

var toMercator = function(footprint) {

    for (var i = 0; i < footprint.length; i++) {
      footprint[i] = toMercatorProj.forward([footprint[i].x,footprint[i].y]);
    };

    return footprint;

};

var toLonLat = function(point) {

    return toMercatorProj.inverse([point[0],point[1]]);

};

// this function do some preparation on certain types of inputs
// TODO: refactor out this functionality to lib, because it will expand
var prepareModuleInput = function(moduleInput, cb) {
    var inputs = moduleInput.inputs;
    Process.findById(moduleInput.processId, function(err, process) {
        var districtPolygon;
        if(err) {
            cb(err);
        } else if(!process) {
            cb({message: 'Process not found'});
        } else {
            // prepare data: TODO put this on as is?
            for(var input in inputs) {
                if(inputs.hasOwnProperty(input)) {
                    if(inputs[input].type === 'district-polygon') {
                        if(inputs[input].projection === 'EPSG:4326') {
                            if(process.district && process.district.geometry && process.district.geometry.features) {
                                districtPolygon = process.district.geometry.features[0];
                                _.each(districtPolygon.geometry.coordinates, function(coords, i) {
                                    var newCoords = [];
                                    _.each(coords, function(coord) {
                                        newCoords.push(toLonLat(coord));
                                    });
                                    districtPolygon.geometry.coordinates[i] = newCoords;
                                });
                            }
                        }
                        inputs[input].value = process.district;
                    }
                }
            }
            cb(null, moduleInput);
        }
    });
};

var doGetModuleInput = function(userId, variantId, moduleId, kpiAlias, asIsVariantId, cb) {

    if(userId && variantId && moduleId && kpiAlias) {
        KpiRecord.findOne({userId: userId, variantId: variantId, moduleId: moduleId, kpiAlias: kpiAlias}, function(err, existingRecord) {
            if(err) {
                cb(err);
            } else if(!existingRecord) {
                // init from as is if first time requested
                if(asIsVariantId) {
                    KpiRecord.findOne({userId: userId, variantId: asIsVariantId, moduleId: moduleId, kpiAlias: kpiAlias}, function(err, asIsRecord) {
                        var newRecord;
                        if(err) {
                            cb(err);
                        } else if(!asIsRecord) {
                            // first time requested for as is - no input exists
                            cb(null, {});
                        } else {
                            // save/copy asIsRecord with variantId
                            asIsRecord._id = mongoose.Types.ObjectId();
                            asIsRecord.isNew = true;
                            newRecord = new KpiRecord(asIsRecord);
                            newRecord.variantId = variantId;
                            newRecord.save(function(err) {
                                if(err) {
                                    cb(err);
                                } else {
                                    cb(null, newRecord);
                                }
                            });
                        }
                    });
                } else {
                    // this is an error
                    cb({message: "Input not found"});
                }
            } else {
                cb(null, existingRecord);
            }
        });
    } else {
        cb({message: "input params missing"});
    }

};

var doSaveKpiRecord = function(kpiRecord, cb) {

    KpiRecord.findOne({variantId: kpiRecord.variantId, kpiAlias: kpiRecord.kpiAlias, userId: kpiRecord.userId}, function(err, existingRecord) {
                    
        var newRecord;

        if(err) {
            cb(err);
        } else if(!existingRecord) {
            newRecord = new KpiRecord(kpiRecord);
            newRecord.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, newRecord);
                }
            });
        } else {

            if(kpiRecord.value || kpiRecord.value === 0) {
                existingRecord.value = kpiRecord.value;
            }

            if(kpiRecord.status) {
                existingRecord.status = kpiRecord.status;
            }

            if(kpiRecord.inputs) {
                existingRecord.inputs = kpiRecord.inputs;
            }

            if(typeof kpiRecord.disabled !== "undefined") {
                existingRecord.disabled = kpiRecord.disabled;
            }

            existingRecord.dateModified = new Date();

            existingRecord.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, existingRecord);
                }
            })
        }
    });
};

var kpiRecord = {

    getKpiRecord: function (req, res) {

        var query = {
            variantId: req.params.variantId,
            kpiAlias: req.params.kpiAlias,
            userId: req.params.userId
        };
        
        if (req.isAuthenticated()) {

            // if(req.user.role === 'Facilitator') {
            //     User.find({facilitatorId: req.user._id})...
            // }

            if(!query.userId) {
                query.userId = req.user._id;
            }

            KpiRecord.find(query, function (err, records) {
                if (err) {
                    res.json(500, err);
                } else {
                    res.json(200, records);
                }
            });

        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },

    getKpiRecords: function(req, res) {

        if(req.isAuthenticated()) {

            Process.findById(req.user.activeProcessId, function(err, process) {
                if (err) {
                    res.status(500).json(err);
                } else if(!process) {
                    res.status(404).json({message: 'Project not found'});
                } else {
                    Variant.find({processId: process._id}, function(err, variants) {
                        var variantIds = _.pluck(variants, '_id');
                        var query = {
                            variantId: {$in: variantIds}
                        };
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            if(req.user.role !== 'Facilitator') {
                                query.userId = req.user._id;
                            }
                            KpiRecord.find(query, function(err, records) {
                                if(err) {
                                    res.status(500).json(err);
                                } else {
                                    var userIds = _.pluck(records, 'userId');
                                    User.find({'_id': {$in: userIds}}, 'fname lname email', function(err, users) {
                                        if (err) {
                                            res.json(500, err);
                                        } else {
                                            res.json(200, {
                                                records: records,
                                                users: users
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

    getModuleInputFramework: function(moduleData, cb) {
        doGetModuleInput(moduleData.userId, moduleData.variantId, moduleData.moduleId, moduleData.kpiAlias, moduleData.asIsVariantId, function(err, moduleInput) {
            if(err) {
                cb(err);
            } else {
                moduleInput.processId = moduleData.processId;
                prepareModuleInput(moduleInput, function(err, preparedModuleInput) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, preparedModuleInput);
                    }
                });
            }
        });
    },

    getModuleInputDashboard: function(req, res) {
        var variantId = req.params.variantId;
        var moduleId = req.params.moduleId;
        var kpiAlias = req.params.kpiAlias;
        var asIsVariantId = req.params.asIsVariantId;

        if (req.isAuthenticated()) {

            doGetModuleInput(req.user._id, variantId, moduleId, kpiAlias, asIsVariantId, function(err, moduleInput) {
                if(err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(moduleInput);
                }
            });

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    },

    saveKpiRecordFromModuleResult: function(moduleOutput, cb) {
        var kpiOutput = _.find(moduleOutput.outputs, function(o) {return o.type === 'kpi';});
        if(kpiOutput && (kpiOutput.value || kpiOutput.value === 0)) {
            moduleOutput.value = kpiOutput.value;
            moduleOutput.kpiAlias = moduleOutput.kpiId;
            doSaveKpiRecord(moduleOutput, function(err, savedRecord) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, savedRecord);
                }
            });
        } else {
            cb({message: 'Module result data is missing'});
        }
    },

    saveKpiRecordStatus: function(moduleData, cb) {
        // modules wants it to be called kpiId instead of kpiAlias
        if(moduleData.kpiId) {
            moduleData.kpiAlias = moduleData.kpiId;
        }
        if(!moduleData.kpiAlias) {
            console.log('ERROR: kpiAlias is not set');
        }
        doSaveKpiRecord(moduleData, function(err, savedRecord) {
            if(err) {
                cb(err);
            } else {
                cb(null, savedRecord);
            }
        });
    },

    saveKpiRecord: function(req, res) {

        var kpiRecord = req.body;

        if (req.isAuthenticated()) {

            if(kpiRecord.variantId && kpiRecord.kpiAlias) {

                if(!kpiRecord.userId) {
                    kpiRecord.userId = req.user._id;
                }

                doSaveKpiRecord(kpiRecord, function(err, savedRecord) {

                    if(err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(savedRecord);
                    }

                });
                
            } else {
                res.status(400).json({message: "input data missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }

    },

    // remove records when kpi is unselected or when module is switched out
    // NOT IMPLEMENTED
    deleteKpiRecord: function(req, res) {

        var kpiAlias = req.params.kpiAlias;

        if (req.isAuthenticated()) {

            if(kpiAlias) {
                Process.findById(req.user.activeProcessId, function(err, process) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!process) {
                        res.status(404).json({message: "Active process not found"});
                    } else {
                        // What to do with this?
                        res.status(200).json({message: "TODO: find the variants connected to this process, find inputs with these variant names, delete"});
                    }
                });
            } else {
                res.status(400).json({message: "kpi id is missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    }
};
module.exports = kpiRecord;