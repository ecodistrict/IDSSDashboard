var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');

var variant = {

    // FRAMEWORK:

    // this function adds a model to the process (the as-is variant)
    // the to-be variant will copy the kpilist of the as-is variant
    // the other variants will only overwrite input that differs
    addModel: function(modelData, cb) {
        console.log(modelData.uid);
        Variant.findById(modelData.uid, function(err, variant) {
            var modelInput;
            if(err) {
                cb(err);
            } else if(!variant) {
                cb({message: "Variant was not found"});
            } else {
                modelInput = {
                    moduleId: modelData.id, 
                    kpiAlias: modelData.kpi,
                    inputs: modelData.inputs
                };
                variant.inputData.push(modelInput);
                variant.save(function(err) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, modelInput);
                    }
                });

            }
        });
    },

    addModelResult: function(modelData, cb) {
        if(modelData.variantId && modelData.modelId && modelData.kpiAlias) {
            Variant.findById(modelData.variantId, function(err, variant) {
                var modelOutput;
                if(err) {
                    cb(err);
                } else if(!variant) {
                    cb({message: "Variant was not found"});
                } else {
                    modelOutput = {
                        moduleId: modelData.modelId,
                        kpiAlias: modelData.kpiAlias,
                        outputs: modelData.outputs
                    };
                    variant.outputData.push(modelOutput);
                    variant.save(function(err) {
                        if(err) {
                            cb(err);
                        } else {
                            cb(null, modelOutput);
                        }
                    });
                }
            });
        } else {
            cb({message: "Error: Model returned output data, but missed something: variant, model or kpi identification"});
        }
    },

    setModelAsProcessing: function(modelData, cb) {
        // get the variant from modelData
        // set status "processing" on outputObject
        // callback
    },

    // DASHBOARD CLIENT:

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
    // returns the input spec of a model
    getModuleInput: function(req, res) {

        var variantId = req.params.variantId;
        var moduleId = req.params.moduleId;

        if (req.isAuthenticated()) {

            if(variantId && moduleId) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleInput = _.find(variant.inputData, function(input) {return input.moduleId === moduleId;});
                        res.status(200).json(moduleInput);
                    }
                });
            } else {
                res.status(400).json({message: "input params missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    },
    updateModuleInput: function(req, res) {

        var variantId = req.params.variantId;
        console.log(variantId);

        console.log(req.body);

        var writeInputValues = function(moduleInputs, newInputs) {
            _.each(moduleInputs, function(input, i) {
                console.log(input);
                console.log(newInputs[i].value);
                if(newInputs[i].value) {
                    input.value = newInputs[i].value;
                }
                if(input.inputs && newInputs[i].inputs) {
                    writeInputValues(input.inputs, newInputs[i].inputs);
                }
            });
            return moduleInputs;
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

                        moduleInput.inputs = writeInputValues(moduleInput.inputs, req.body.inputs);
                        console.log(variant.inputData);
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
                        var moduleOuput = _.find(variant.outputData, function(output) {return output.moduleId === moduleId && output.kpiAlias === output.kpiAlias;});
                        res.status(200).json(moduleOuput);
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