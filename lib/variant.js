var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');
var User = mongoose.model('User');

function createVariant(req, res) {

    var variantData = req.body;

    if(req.user.activeCaseId) {

        variantData.userId = req.user._id;
        variantData.caseId = req.user.activeCaseId;

        _createVariant(variantData, function(err, newVariant) {
            if(err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(newVariant);
        });

    } else {
        res.status(422).json({message: "No active case id is set"});
    }
}

function _createVariant(variantData, cb) {

    var newVariant = new Variant(variantData);

    newVariant.save(function(err) {
        if(err) {
            cb(err);
        } else {
            cb(null, newVariant);
        }
    });
        
}

function updateVariant(req, res) {
    var variantData = req.body;

    _updateVariant(variantData, function(err, variant) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(variant);
    });
   
}

function _updateVariant(variantData, cb) {
    // TODO: authorization is removed for facilitator to update stakeholders kpis, check this instead of removing auth completely
    Variant.findOne({_id: variantData._id}, function(err, variant) {
        if(err) {
            cb(err)
        } else if(!variant) {
            cb({message: "Variant was not found"});
        } else {

            if(variantData.name) {
                variant.name = variantData.name;
            }
            if(variantData.description) {
                variant.description = variantData.description;
            }
            
            variant.dateModified = new Date();
            
            variant.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, variant);
                }
            });
                  
        }
    });
}

function deleteVariant(req, res) {
    
    var variantId;

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
}

function getVariants(req, res) {
    var userId = req.user.facilitatorId ? req.user.facilitatorId : req.user._id; // if stakeholder, get variants from facilitator
    if(req.user.activeCaseId) {
        _getVariants(userId, req.user.activeCaseId, function(err, variants) {
            if(err) {
                return res.status(500).json(err);
            }
            return res.status(200).json(variants);
        });
    } else {
        res.status(422).json({message: "No active process was found"});
    }
}

function _getVariants(userId, caseId, cb) {
    
    Variant.find({userId: userId, caseId: caseId}, 'name description type',function(err, variants) {

        var asIsVariant, newVariant;

        if (err) {
            cb(err);
        } else {
            // if as is variant not exist, create one
            asIsVariant = _.find(variants, function(v) {return v.type === 'as-is';});
            if(!asIsVariant) {
                newVariant = new Variant({
                    userId: userId,
                    caseId: caseId,
                    type: 'as-is',
                    name: 'As is',
                    description: 'The AS IS contains assessment data of the current state of the district'
                });

                newVariant.save(function(err) {
                    if(err) {
                        cb(err);
                    } else {
                        newVariant.isNew = true; // to send message to data module from client
                        variants.push(newVariant);
                        cb(null, variants);
                    }
                });
            } else {
                cb(null, variants);   
            }
        }
    });
}

function getVariantsByProcessId(req, res) {
    
    if(req.user.activeCaseId) {

        Variant.find({processId: req.user.activeCaseId}, 'name userId description type kpiList connectedVariantId', function(err, variants) {
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

}

function getVariant (req, res) {

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
}

module.exports = {
    createVariant: createVariant,
    updateVariant: updateVariant,
    deleteVariant: deleteVariant,
    getVariants: getVariants,
    getVariantsByProcessId: getVariantsByProcessId,
    getVariant: getVariant
};