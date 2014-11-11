var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');

var doGetModuleInput = function(variantId, moduleId, kpiAlias, cb) {

    if(variantId && moduleId) {
        Variant.findById(variantId, function(err, variant) {
            if(err) {
                cb(err);
            } else if(!variant) {
                cb({message: "Variant not found"});
            } else {
                var moduleInput = _.find(variant.inputData, function(input) {return input.moduleId === moduleId;});
                cb(null, moduleInput);
            }
        });
    } else {
        cb({message: "input params missing"});
    }
        
};

var variant = {

    // FRAMEWORK:

    // this function adds a module to the process (the as-is variant)
    // the to-be variant will copy the kpilist of the as-is variant
    // the other variants will only overwrite input that differs
    addModule: function(moduleData, cb) {
        console.log(moduleData);
        Variant.findById(moduleData.variantId, function(err, variant) {
            var moduleInput;
            if(err) {
                cb(err);
            } else if(!variant) {
                cb({message: "Variant was not found"});
            } else {
                moduleInput = {
                    moduleId: moduleData.moduleId, 
                    kpiAlias: moduleData.kpiAlias,
                    inputs: moduleData.inputs
                };
                variant.inputData.push(moduleInput);
                variant.save(function(err) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, moduleInput);
                    }
                });

            }
        });
    },

    addModuleResult: function(moduleData, cb) {
        if(moduleData.variantId && moduleData.moduleId && moduleData.kpiAlias) {
            Variant.findById(moduleData.variantId, function(err, variant) {
                var moduleOutput;
                if(err) {
                    cb(err);
                } else if(!variant) {
                    cb({message: "Variant was not found"});
                } else {
                    moduleOutput = {
                        moduleId: moduleData.moduleId,
                        kpiAlias: moduleData.kpiAlias,
                        outputs: moduleData.outputs,
                        status: 'success'
                    };
                    variant.outputData.push(moduleOutput);
                    variant.save(function(err) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null, moduleOutput);
                        }
                    });
                }
            });
        } else {
            cb({message: "Error: Module returned output data, but missed something: variant, module or kpi identification"});
        }
    },

    setModuleAsProcessing: function(moduleData, cb) {
        // get the variant from moduleData
        // set status "processing" on outputObject
        // callback
    },

    // Same call as for dashboard below but this function is dedicated for getting input to be sent to modules through framework
    getModuleInputFramework: function(moduleData, cb) {
        doGetModuleInput(moduleData.variantId, moduleData.moduleId, moduleData.kpiAlias, function(err, moduleInput) {
            if(err) {
                cb(err);
            } else {
                cb(null, moduleInput);
            }
        });
    },

    saveModuleOutputStatus: function(moduleData, status, cb) {
        var variantId = moduleData.variantId;
        var moduleId = moduleData.moduleId;
        var kpiAlias = moduleData.kpiAlias;

        if(variantId && moduleId && kpiAlias && status) {
            Variant.findById(variantId, function(err, variant) {
                if(err) {
                    cb(err);
                } else if(!variant) {
                    cb({message: "Variant not found"});
                } else {
                    var moduleOutput = _.find(variant.outputData, function(output) {return output.moduleId === moduleId && output.kpiAlias === kpiAlias;});

                    // no post for module output was found, create one!
                    if(!moduleOutput) {
                        moduleOutput = {
                            moduleId: moduleId,
                            kpiAlias: kpiAlias
                        };
                        variant.outputData.push(moduleOutput);
                    }

                    moduleOutput.status = status;
                        
                    Variant.findOneAndUpdate({ _id: variant._id.toString() }, _.omit(variant.toJSON(), [ '_id', '__v' ]), function(err) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null, {message: "Module output status was set to " + status});
                        }
                    });
                }
            });
        } else {
            cb({message: "input params missing"});
        }
        
    },

    // DASHBOARD CLIENT API:

    createVariant: function (req, res) {

        var newVariant;

        if (req.isAuthenticated()) {

            if(req.user.activeProcessId) {

                newVariant = new Variant(req.body);

                newVariant.processId = req.user.activeProcessId;
                newVariant.userId = req.user._id;

                newVariant.save(function(err) {
                    if(err) {
                        res.status(500).json(err);
                    } else {
                        res.status(200).json(newVariant);
                    }
                });

            } else {
                res.status(400).json({message: "Active process id is missing"});
            }

        } else {
            res.status(401).json({message: 'Not authenticated'});
        }

    },
    updateVariant: function (req, res) {

        var variantId = req.body._id;
        if (req.isAuthenticated()) {

            Variant.findOne({userId: req.user.id, _id: variantId}, function(err, variant) {
                if(err) {
                    res.status(500).json(err)
                } else if(!variant) {
                    res.status(404).json({message: "Variant was not found"});
                } else {

                    variant.kpiList = req.body.kpiList;

                    variant.dateModified = new Date();
                    
                    variant.save(function(err) {
                        if(err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(variant);
                        }
                    });
                          
                }
            });
        } else {
            res.status(401).json({ message: "Not authenticated"});
        }
    },
    deleteVariant: function (req, res) {
        var variantId;

        if (req.isAuthenticated()) {
            variantId = req.params.variantId || 'dummy id';
            Variant.findOne({_id: variantId, userId: req.user._id}, function(err, variant) {
                if(err) {
                    res.status(500).json(err);
                } else if(!variant) {
                    res.status(404).json({message: "Variant not found or not authorized"});
                } else {
                    variant.remove(function (err) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(variant);
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
    getVariants: function (req, res) {
        if (req.isAuthenticated()) {

            if(req.user.activeProcessId) {

                Variant.find({userId: req.user._id, processId: req.user.activeProcessId}, 'name description type kpiList',function(err, variants) {

                    var asIsVariant, newVariant;

                    if (err) {
                        res.json(500, err);
                    } else {
                        // if as is variant not exist, create one
                        asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
                        if(!asIsVariant) {
                            newVariant = new Variant({
                                userId: req.user._id,
                                processId: req.user.activeProcessId,
                                type: 'as-is',
                                name: 'As is',
                                description: 'The AS IS contains assessment data of the current state of the district'
                            });

                            newVariant.save(function(err) {
                                if(err) {
                                    res.status(500).json(err);
                                } else {
                                    variants.push(newVariant);
                                    res.status(200).json(variants);
                                }
                            });
                        } else {
                            res.json(200, variants);   
                        }
                    }
                });

            } else {
                res.status(400).json({message: "No process is active"});
            }

        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getVariant: function (req, res) {

        var variantId = req.params.variantId || 'dummy id';
        
        if (req.isAuthenticated()) {

            Variant.findById(variantId, function (err, variant) {
                if (err) {
                    res.json(500, err);
                } else if(!variant) {
                    res.json(404, {message: "Variant not found"});
                } else {
                    res.json(200, variant);
                }
            });
            
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    // returns the input spec of a module
    getModuleInput: function(req, res) {

        var variantId = req.params.variantId;
        var moduleId = req.params.moduleId;
        var kpiAlias = "TODO: replace this with the kpi alias! (not implemented)";

        if (req.isAuthenticated()) {

            doGetModuleInput(variantId, moduleId, kpiAlias, function(err, moduleInput) {
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
    // updates one or more of the inputs of a module
    // body should be an object with moduleId and an inputs array with id and value for every input in module input specification
    updateModuleInput: function(req, res) {

        var variantId = req.params.variantId;

        var writeInputValues = function(newInput, moduleInputs) {
            _.each(moduleInputs, function(input) {
                
                if(input.id === newInput.id) {
                    input.value = newInput.value;
                    console.log('found ' + input.id + ' and wrote values');
                } else if(input.inputs) {
                    writeInputValues(newInput, input.inputs);
                }
            });
        };

        if (req.isAuthenticated()) {

            if(variantId && req.body.moduleId && req.body.inputs) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleInput = _.find(variant.inputData, function(input) {return input.moduleId === req.body.moduleId;});
                        _.each(req.body.inputs, function(newInput) {
                            // find recursively newInput.id in moduleInput
                            writeInputValues(newInput, moduleInput.inputs);
                        });
                        Variant.findOneAndUpdate({ _id: variant._id.toString() }, _.omit(variant.toJSON(), [ '_id', '__v' ]), function(err) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({message: "Inputs was successfully saved"});
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
        var kpiAlias = req.params.kpiAlias;

        if (req.isAuthenticated()) {

            if(variantId && moduleId && kpiAlias) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleOutput = _.find(variant.outputData, function(output) {return output.moduleId === moduleId && output.kpiAlias === output.kpiAlias;});
                        // if output post didnt exist, create one to return, this is later created and saved in setModuleOutputStatus
                        if(!moduleOutput) {
                            moduleOutput = {
                                status: 'unprocessed'
                            }
                        } else if(!moduleOutput.status) {
                            // if the status is not set, set default
                            moduleOutput.status = 'unprocessed';
                        }
                        res.status(200).json(moduleOutput);
                    }
                });
            } else {
                res.status(400).json({message: "input params missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    }    
};
module.exports = variant;