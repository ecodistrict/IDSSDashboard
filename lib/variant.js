var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Variant = mongoose.model('Variant');
var User = mongoose.model('User');

var variant = {

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
    }
};
module.exports = variant;