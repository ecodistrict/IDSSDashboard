var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');

// this function do some preparation on certain types of inputs
// TODO: refactor out this functionality to lib, because it will expand
var prepareModuleInput = function(moduleInput, userRepository, processRepository, cb) {
    userRepository.getUserById(moduleInput.userId, function(err, user) {
        if(err) {
            cb(err);
        } else {
            processRepository.getProcessById(user.activeProcessId, function(err, process) {
                if(err) {
                    cb(err);
                } else {
                    // do the preparation job
                    _.each(moduleInput.inputs, function(input) {

                        if(input.type === 'district-polygon') {
                            console.log('district-polygon found');
                            console.log(process.district.geometry);
                            input.value = process.district;
                        }
                    });
                    cb(null, moduleInput);
                }
            });
        }
    });
};

var doGetModuleInput = function(variantId, moduleId, kpiAlias, cb) {

    if(variantId && moduleId) {
        Variant.findById(variantId, function(err, variant) {
            if(err) {
                cb(err);
            } else if(!variant) {
                cb({message: "Variant not found"});
            } else {
                // return module data for only one kpi
                var moduleInput = _.find(variant.inputData, function(input) {return input.moduleId === moduleId && input.kpiAlias === kpiAlias;});
                if(moduleInput) {
                    // let the inputs now their user
                    moduleInput.userId = variant.userId;
                    cb(null, moduleInput);
                } else {
                    cb({message: "Module input for variant " + variantId + " moduleId " + moduleId + " kpiAlias " + kpiAlias + " was not found"});
                }
                
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
        Variant.findById(moduleData.variantId, function(err, variant) {
            var moduleInput;
            if(err) {
                err.userId = variant.userId;
                cb(err);
            } else if(!variant) {
                cb({message: "Variant was not found", userId: variant.userId});
            } else {
                moduleInput = {
                    moduleId: moduleData.moduleId, 
                    kpiAlias: moduleData.kpiAlias,
                    inputs: moduleData.inputs,
                    userId: variant.userId
                };
                var found = _.find(variant.inputData, function(o) {return o.kpiAlias === moduleData.kpiAlias && o.moduleId === moduleData.moduleId;});
                if(found) {
                    // replace if result data exists
                    found.inputs = moduleInput.inputs;
                    found.status = moduleInput.status;
                    console.log('replacing input');
                } else {
                    // add new result data
                    variant.inputData.push(moduleInput);
                    console.log('adding input');
                }
                variant.save(function(err) {
                    if(err) {
                        err.userId(variant.userId);
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
            Variant.findById(moduleData.variantId).lean().exec(function(err, variant) {
                var moduleOutput;
                if(err) {
                    err.userId = variant.userId;
                    cb(err);
                } else if(!variant) {
                    cb({message: "Variant was not found", userId: variant.userId});
                } else {
                    
                    moduleOutput = _.find(variant.outputData, function(o) {return o.kpiAlias === moduleData.kpiAlias && o.moduleId === moduleData.moduleId;});
                    console.log(moduleOutput);
                    console.log(moduleData);
                    if(moduleOutput) {

                        //if(moduleOutput.outputs.length === 0) {
                        if(false) {
                            console.log('output data was changed');

                            // Variant.update({'outputData.kpiAlias': moduleData.kpiAlias}, {'$set': {
                            //     'outputData.$.outputs': moduleData.outputs,
                            //     'outputData.$.status': 'success'
                            // }}, function(err) {
                            //     if(err) {
                            //         cb(err);
                            //     } else {
                            //         cb(null, moduleData);
                            //     }
                            // });

                            moduleOutput.status = 'success';
                            moduleOutput.outputs = moduleData.outputs;
                            moduleOutput.userId = variant.userId;

                            Variant.findOneAndUpdate({ _id: moduleData.variantId }, _.omit(variant, [ '_id', '__v' ]), function(err) {
                                if(err) {
                                    err.userId = variant.userId;
                                    cb(err);
                                } else {
                                    cb(null, moduleOutput);
                                }
                            });

                            
                        } else {
                            console.log('output data was updated');

                            moduleOutput.outputs = moduleData.outputs;
                            moduleOutput.userId = variant.userId;
                            moduleOutput.status = 'success';

                            Variant.findById(moduleData.variantId, function(err, variantUpdate) {

                                var moduleOutputUpdate = _.find(variantUpdate.outputData, function(o) {return o.kpiAlias === moduleData.kpiAlias && o.moduleId === moduleData.moduleId;});
                                moduleOutputUpdate.outputs = moduleData.outputs;
                                moduleOutputUpdate.status = 'success';

                                Variant.findOneAndUpdate({ _id: moduleData.variantId }, _.omit(variantUpdate.toJSON(), [ '_id', '__v' ]), function(err) {
                                    if(err) {
                                        err.userId = variant.userId;
                                        cb(err);
                                    } else {
                                        // return the lean version
                                        cb(null, moduleOutput);
                                    }
                                });
                            });
                        }
                        
                    } else {
                        
                        // create a new post
                        moduleOutput = {
                            moduleId: moduleData.moduleId,
                            kpiAlias: moduleData.kpiAlias,
                            outputs: moduleData.outputs,
                            status: 'success',
                            userId: variant.userId
                        };
                        // add new result data
                        console.log('new output data was added to module');
                        variant.outputData.push(moduleOutput);

                        Variant.findOneAndUpdate({ _id: moduleData.variantId }, _.omit(variant, [ '_id', '__v' ]), function(err) {
                            if(err) {
                                err.userId = variant.userId;
                                cb(err);
                            } else {
                                // return the lean version
                                cb(null, moduleOutput);
                            }
                        });
                        
                    }

                    // Variant.update({_id: moduleData.variantId}, variant, function(err) {
                    //     if(err) {
                    //         cb(err);
                    //     } else {
                    //         cb(null, moduleOutput);
                    //     }
                    // });

                    // Variant.findByIdAndUpdate(variant.moduleId, {$set: {'outputData': variant.outputData}}, function(err) {
                    //     if(err) {
                    //         cb(err);
                    //     } else {
                    //         cb(null, moduleOutput);
                    //     }
                    // });

                    

                    // variant.save(function(err) {
                    //     if(err) {
                    //         cb(err);
                    //     } else {
                    //         cb(null, moduleOutput);
                    //     }
                    // });

                    // Variant.update({'outputData.kpiAlias': kpiAlias}, {'$set': {
                    //     'outputData.$.outputs': moduleData.outputs)}}, 
                    // }}, function(err) { ...
                    
                    
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
    getModuleInputFramework: function(moduleData, userRepository, processRepository, cb) {
        doGetModuleInput(moduleData.variantId, moduleData.moduleId, moduleData.kpiAlias, function(err, moduleInput) {
            if(err) {
                cb(err);
            } else {
                prepareModuleInput(moduleInput, userRepository, processRepository, function(err, preparedModuleInput) {
                    if(err) {
                        cb(err);
                    } else {
                        cb(null, preparedModuleInput);
                    }
                });
            }
        });
    },

    saveModuleOutputStatus: function(moduleData, cb) {
        var variantId = moduleData.variantId;
        var moduleId = moduleData.moduleId;
        var kpiAlias = moduleData.kpiAlias;
        var status = moduleData.status;

        if(variantId && moduleId && kpiAlias && status) {
            Variant.findById(variantId, function(err, variant) {
                if(err) {
                    err.userId = variant.userId;
                    cb(err);
                } else if(!variant) {
                    cb({message: "Variant not found", userId: variant.userId});
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
                            err.userId = variant.userId;
                            cb(err);
                        } else {
                            cb(null, {userId: variant.userId ,message: "Module output status was set to " + status});
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
        var kpiAlias = req.params.kpiAlias;

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

            if(variantId && req.body.moduleId && req.body.inputs && req.body.kpiAlias) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleInput = _.find(variant.inputData, function(input) {return input.moduleId === req.body.moduleId && input.kpiAlias === req.body.kpiAlias;});
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
    // remove input when kpi is unselected or when module is switched out
    deleteModuleInput: function(req, res) {

        var variantId = req.params.variantId;
        var kpiAlias = req.params.kpiAlias;

        if (req.isAuthenticated()) {

            if(variantId && kpiAlias) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleInput = _.find(variant.inputData, function(input) {return input.kpiAlias === kpiAlias;});
                        if(moduleInput) {
                            variant.inputData = _.reject(variant.inputData, function(input) {
                                return input.id === moduleInput.id;
                            });
                        }
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
    // remove output when kpi is unselected or when module is switched out
    deleteModuleOutput: function(req, res) {

        var variantId = req.params.variantId;
        var kpiAlias = req.params.kpiAlias;

        if (req.isAuthenticated()) {

            if(variantId && kpiAlias) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
                    } else {
                        var moduleOutput = _.find(variant.outputData, function(input) {return input.kpiAlias === kpiAlias;});
                        if(moduleOutput) {
                            variant.outputData = _.reject(variant.outputData, function(input) {
                                return input.id === moduleOutput.id;
                            });
                        }
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
    },
    // TODO: duplication! fix common functions between dashboard and framework
    updateModuleOutputStatus: function(req, res) {

        if (req.isAuthenticated()) {

            var variantId = req.body.variantId;
            var moduleId = req.body.moduleId;
            var kpiAlias = req.body.kpiAlias;
            var status = req.body.status;

            if(variantId && moduleId && kpiAlias && status) {
                Variant.findById(variantId, function(err, variant) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!variant) {
                        res.status(404).json({message: "Variant not found"});
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
                                res.status(500).json(err);
                            } else {
                                res.status(200).json({message: "Module output status was set to " + status});
                            }
                        });
                    }
                });
            } else {
                res.status(401).json({message: "input params missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }

    }
};
module.exports = variant;