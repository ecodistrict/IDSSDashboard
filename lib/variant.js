var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');
var Input = mongoose.model('Input');
var Output = mongoose.model('Output');
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
var prepareModuleInput = function(moduleInput, userRepository, processRepository, cb) {
    var inputs = moduleInput.inputSpecification;
    userRepository.getUserById(moduleInput.userId, function(err, user) {
        if(err) {
            cb(err);
        } else {
            processRepository.getProcessById(user.activeProcessId, function(err, process) {
                var districtPolygon;
                if(err) {
                    cb(err);
                } else {
                    console.log('moduleInput');
                    console.log(inputs);
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
        }
    });
};

var doGetModuleInput = function(variantId, moduleId, kpiId, asIsVariantId, cb) {

    if(variantId && moduleId && kpiId) {
        Input.findOne({variantId: variantId, moduleId: moduleId, kpiId: kpiId}, function(err, input) {
            if(err) {
                cb(err);
            } else if(!input) {
                // init from as is if first time requested
                if(asIsVariantId) {
                    Input.findOne({variantId: asIsVariantId, moduleId: moduleId, kpiId: kpiId}, function(err, asIsInput) {
                        var newInput;
                        if(err) {
                            cb(err);
                        } else if(!asIsInput) {
                            // this is an error
                            cb({message: "Input not found"});
                        } else {
                            // save/copy asIsInput with variantId
                            asIsInput._id = mongoose.Types.ObjectId();
                            asIsInput.isNew = true;
                            newInput = new Input(asIsInput);
                            newInput.variantId = variantId;
                            newInput.save(function(err) {
                                if(err) {
                                    cb(err);
                                } else {
                                    cb(null, newInput);
                                }
                            });
                        }
                    });
                } else {
                    // this is an error
                    cb({message: "Input not found"});
                }
            } else {
                cb(null, input);
            }
        });
    } else {
        cb({message: "input params missing"});
    }

};

var doUpdateModuleOutput = function(moduleData, cb) {

    var variantId = moduleData.variantId;
    var moduleId = moduleData.moduleId;
    var kpiId = moduleData.kpiId;
    var status = moduleData.status || 'unprocessed';

    console.log('this is whats getting saved');
    console.log(moduleData);

    // make sure the variant exists
    Variant.findById(variantId, function(err, variant) {
        if(err) {
            err.userId = variant.userId;
            cb(err);
        } else if(!variant) {
            cb({message: "Variant not found", userId: variant.userId});
        } else {
            // find existing kpi in kpiResults
            // write kpi value and status
            Output.findOne({variantId: variantId, moduleId: moduleId, kpiId: kpiId}, function(err, output) {
                if(err) {
                    err.userId = variant.userId;
                    cb(err);
                } else {
                    if(!output) {
                        output = new Output(moduleData);
                    }
                    if(status) {
                        output.status = status;
                    }
                    if(moduleData.outputs) {
                        output.outputs = moduleData.outputs;
                        console.log(moduleData);
                    }
                    output.userId = variant.userId;
                    output.save(function(err) {
                        if(err) {
                            err.userId = variant.userId;
                            cb(err);
                        } else {
                            var msg = "Module output status was set to " + status;
                            console.log(msg);
                            cb(null, {
                                userId: variant.userId,
                                message: msg,
                                variantId: variantId,
                                moduleId: moduleId,
                                kpiId: kpiId,
                                status: status
                            });
                        }
                    });
                }
            });
        }
    });

};

var variant = {

    // FRAMEWORK:

    // this function adds a module to the process (the as-is variant)
    // the to-be variant will copy the kpilist of the as-is variant
    // the other variants will only overwrite input that differs
    addModule: function(moduleData, cb) {
        // make sure the variant exists
        Variant.findById(moduleData.variantId, function(err, variant) {
            var moduleInput;
            if(err) {
                err.userId = variant.userId;
                cb(err);
            } else if(!variant) {
                cb({message: "Variant was not found", userId: variant.userId});
            } else {
                Input.findOne({variantId: moduleData.variantId, moduleId: moduleData.moduleId, kpiId: moduleData.kpiId, userId: variant.userId}, function(err, foundInput) {
                    if(err) {
                        err.userId = variant.userId;
                        cb(err);
                    } else if(foundInput) {
                        // module already found - replace data (why would this happen..?)
                        foundInput.inputSpecification = moduleData.inputSpecification;
                        foundInput.save(function(err){
                            if(err) {
                                err.userId = variant.userId;
                                cb(err);
                            } else {
                                cb(null, moduleData);
                            }
                        });
                    } else {
                        moduleData.userId = variant.userId;
                        var newInput = new Input(moduleData);
                        newInput.save(function(err) {
                            if(err) {
                                err.userId = variant.userId;
                                cb(err);
                            } else {
                                cb(null, moduleData);
                            }
                        });
                    } 
                });
            }
        });
    },

    addModuleResult: function(moduleData, cb) {

        doUpdateModuleOutput(moduleData, function(err, response) {
            if(err) {
                cb(err);
            } else {
                cb(null, response);
            }
        });
    },

    setModuleAsProcessing: function(moduleData, cb) {
        // get the variant from moduleData
        // set status "processing" on outputObject
        // callback
    },

    // Same call as for dashboard below but this function is dedicated for getting input to be sent to modules through framework
    getModuleInputFramework: function(moduleData, userRepository, processRepository, cb) {
        doGetModuleInput(moduleData.variantId, moduleData.moduleId, moduleData.kpiId, moduleData.asIsVariantId, function(err, moduleInput) {
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

            // TODO: authorization is removed for facilitator to update stakeholders kpis, check this instead of removing auth completely
            Variant.findOne({_id: variantId}, function(err, variant) {
                if(err) {
                    res.status(500).json(err)
                } else if(!variant) {
                    res.status(404).json({message: "Variant was not found"});
                } else {

                    variant.kpiResults = req.body.kpiResults;

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

        var userId;

        if (req.isAuthenticated()) {

            if(req.user.activeProcessId) {

                userId = req.user.facilitatorId ? req.user.facilitatorId : req.user._id; // if stakeholder, get variants from facilitator

                Variant.find({userId: userId, processId: req.user.activeProcessId}, 'name description type',function(err, variants) {

                    var asIsVariant, newVariant;

                    if (err) {
                        res.json(500, err);
                    } else {
                        // if as is variant not exist, create one
                        asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
                        if(!asIsVariant) {
                            newVariant = new Variant({
                                userId: userId,
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
    getVariantsByProcessId: function (req, res) {
        if (req.isAuthenticated()) {

            if(req.user.activeProcessId) {

                Variant.find({processId: req.user.activeProcessId}, 'name userId description type kpiList connectedVariantId',function(err, variants) {
                    if (err) {
                        res.json(500, err);
                    } else {
                        var userIds = _.pluck(variants, 'userId');
                        User.find({'_id': {$in: userIds}}, 'fname lname email', function(err, users) {
                            if (err) {
                                res.json(500, err);
                            } else {
                                res.json(200, {
                                    variants: variants,
                                    users: users
                                });   
                            }
                        });
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
    // TODO: move this to a separate input repo
    getModuleInput: function(req, res) {

        var variantId = req.params.variantId;
        var moduleId = req.params.moduleId;
        var kpiId = req.params.kpiId;
        var asIsVariantId = req.params.asIsVariantId;

        if (req.isAuthenticated()) {

            doGetModuleInput(variantId, moduleId, kpiId, asIsVariantId, function(err, moduleInput) {
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
    updateModuleInput: function(req, res) {

        var variantId = req.params.variantId,
            moduleId = req.body.moduleId,
            kpiId = req.body.kpiId,
            newInputSpecification = req.body.inputSpecification;

        if (req.isAuthenticated()) {

            if(variantId && moduleId && kpiId && newInputSpecification) {
                Input.findOne({variantId: variantId, kpiId: kpiId, moduleId: moduleId}, function(err, existingInput) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!existingInput) {
                        res.status(404).json({message: "Input not found"});
                    } else {
                        existingInput.inputSpecification = newInputSpecification;
                        existingInput.save(function(err) {
                            if(err) {
                                res.status(500).json(err);
                            } else {
                                res.status(200).json(existingInput);
                            }
                        })
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

        var kpiId = req.params.kpiId;

        if (req.isAuthenticated()) {

            if(kpiId) {
                Process.findById(req.user.activeProcessId, function(err, process) {
                    if(err) {
                        res.status(500).json(err);
                    } else if(!process) {
                        res.status(404).json({message: "Active process not found"});
                    } else {
                        res.status(200).json({message: "TODO: find the variants connected to this process, find inputs with these variant names, delete"});
                    }
                });
                // Variant.findById(variantId, function(err, variant) {
                //     if(err) {
                //         res.status(500).json(err);
                //     } else if(!variant) {
                //         res.status(404).json({message: "Variant not found"});
                //     } else {
                //         var moduleInput = _.find(variant.inputData, function(input) {return input.kpiId === kpiId;});
                //         if(moduleInput) {
                //             variant.inputData = _.reject(variant.inputData, function(input) {
                //                 return input.id === moduleInput.id;
                //             });
                //         }
                //         Variant.findOneAndUpdate({ _id: variant._id.toString() }, _.omit(variant.toJSON(), [ '_id', '__v' ]), function(err) {
                //             if(err) {
                //                 res.status(500).json(err);
                //             } else {
                //                 res.status(200).json({message: "Inputs was successfully removed"});
                //             }
                //         });
                //     }
                // });
            } else {
                res.status(400).json({message: "kpi id is missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }
    },
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
module.exports = variant;