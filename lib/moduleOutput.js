var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');
var Output = mongoose.model('Output');
var User = mongoose.model('User');

var doUpdateModuleOutput = function(moduleData, cb) {

    var variantId = moduleData.variantId;
    var moduleId = moduleData.moduleId;
    var kpiAlias = moduleData.kpiAlias = moduleData.kpiId;

    // make sure the variant exists
    Variant.findById(variantId, function(err, variant) {
        if(err) {
            err.userId = variant.userId;
            cb(err);
        } else if(!variant) {
            cb({message: "Variant not found", userId: moduleData.userId});
        } else {
            // find existing kpi in kpiResults
            // write kpi value and status
            Output.findOne({variantId: variantId, moduleId: moduleId, kpiAlias: kpiAlias}, function(err, output) {
                if(err) {
                    err.userId = variant.userId;
                    cb(err);
                } else {
                    if(!output) {
                        output = new Output(moduleData);
                    } else if(moduleData.outputs) {
                        output.outputs = moduleData.outputs;
                    }
                    output.userId = variant.userId;
                    output.dateModified = new Date();
                    output.save(function(err) {
                        if(err) {
                            err.userId = variant.userId;
                            cb(err);
                        } else {
                            cb(null, {
                                userId: variant.userId,
                                variantId: variantId,
                                moduleId: moduleId,
                                kpiAlias: kpiAlias
                            });
                        }
                    });
                }
            });
        }
    });

};

var moduleOutput = {

    addModuleResult: function(moduleData, cb) {
        doUpdateModuleOutput(moduleData, function(err, response) {
            if(err) {
                cb(err);
            } else {
                cb(null, response);
            }
        });
    },

    saveModuleOutputStatus: function(moduleData, cb) {
        console.log('save output status');
        console.log(moduleData);
        doUpdateModuleOutput(moduleData, function(err, response) {
            if(err) {
                cb(err);
            } else {
                cb(null, response);
            }
        });
        
    },

    // DASHBOARD CLIENT API:

    // remove output when kpi is unselected or when module is switched out
    deleteModuleOutput: function(req, res) {

        var variantId = req.params.variantId;
        var kpiId = req.params.kpiId;

        if (req.isAuthenticated()) {

            if(variantId && kpiId) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleOutput = _.find(variant.outputData, function(input) {return input.kpiId === kpiId;});
                        if(moduleOutput) {
                            variant.outputData = _.reject(variant.outputData, function(input) {
                                return input.id === moduleOutput.id;
                            });
                        }
                        Variant.findOneAndUpdate({ _id: variant._id.toString() }, _.omit(variant.toJSON(), [ '_id', '__v' ]), function(err) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({message: "Ouputs was successfully removed"});
                            }
                        });
                    }
                });
            } else {
                res.status(400).json({message: "input data missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    },
    getModuleOutput: function(req, res) {

        var variantId = req.params.variantId;
        var moduleId = req.params.moduleId;
        var kpiId = req.params.kpiId;

        if (req.isAuthenticated()) {

            if(variantId && moduleId && kpiId) {

                Output.findOne({variantId: variantId, moduleId: moduleId, kpiId: kpiId}, function(err, output) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!output) {
                        // create if not exists, this is the case when querying for output on as-is page first time
                        var newOutput = {
                            variantId: variantId,
                            moduleId: moduleId,
                            kpiId: kpiId,
                            status: 'unprocessed'
                        };
                        doUpdateModuleOutput(newOutput, function(err, savedOutput) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json(savedOutput);
                            }
                        });
                    } else {
                        res.status(200).json(output);
                    }
                });
            } else {
                res.status(400).json({message: "input params missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    },
    updateModuleOutputStatus: function(req, res) {

        if (req.isAuthenticated()) {

            doUpdateModuleOutput(req.body, function(err, response) {
                if(err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json(response);
                }
            });

        } else {
            res.status(401).json({message: "Not authenticated"});
        }

    }
};
module.exports = moduleOutput;