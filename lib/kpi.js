var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Kpi = mongoose.model('Kpi');

var kpi = {

    createKpi: function (req, res) {

        var newKpi;

        if (req.isAuthenticated()) {

            if(req.body.name) {

                newKpi = new Kpi(req.body);

                newKpi.alias = newKpi.name.toLowerCase().split(' ').join('-');

                var query = {
                    alias: newKpi.alias
                };

                // // either look for duplicates in kpi.official or in users own kpis
                // if(newKpi.official) {
                //     query.official = true;
                // } else {
                //     query.userId = req.user._id;
                // }

                Kpi.findOne(query, function(err, alreadyExists) {

                    var returnData;

                    if(err) {
                        res.status(500).json(err);
                    } else if(alreadyExists && alreadyExists.official || alreadyExists && alreadyExists.userId === req.user._id || !newKpi.name) {
                        res.status(400).json({message: "Name does not exist or is already taken by another KPI"})
                    } else {

                        newKpi.userId = req.user._id;

                        newKpi.save(function(err) {
                            if(err) {
                                res.json(500, err);
                            } else {
                                returnData = newKpi.toObject();
                                returnData.canDelete = true;
                                res.json(200, returnData);
                            }
                        });

                    }

                });

            } else {
                res.json(400, {message: 'Kpi name is missing'});
            }

        } else {
            res.json(401, {message: 'Not authenticated'});
        }

    },
    updateKpi: function (req, res) {

        var kpiData = req.body;

        if (req.isAuthenticated()) {

            Kpi.findOne({userId: req.user.id, _id: kpiData._id}, function(err, kpi) {
                if(err) {
                    res.json(500, err)
                } else if(!kpi) {
                    res.json(404, {message: "Not authorized or KPI not found"});
                } else {

                    if(kpiData.name) {
                        kpi.name = kpiData.name;
                    }
                    if(kpiData.description) {
                        kpi.description = kpiData.description;
                    }
                    if(kpiData.unit) {
                        kpi.unit = kpiData.unit;
                    }
                    if(typeof kpi.qualitative !== 'undefined' && kpi.qualitative !== null) {
                        kpi.qualitative = kpiData.qualitative;
                    } 
                    if(typeof kpi.official !== 'undefined' && kpi.official !== null) {
                        kpi.official = kpiData.official;
                    }   

                    kpi.dateModified = new Date();
                    
                    kpi.save(function(err) {
                        if(err) {
                            res.json(500, err);
                        } else {
                            res.json(200, kpi);
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
    deleteKpi: function (req, res) {
        var kpiId;

        if (req.isAuthenticated()) {
            kpiId = req.params.kpiId || 'dummy id';
            Kpi.findOne({_id: kpiId, userId: req.user._id}, function(err, kpi) {
                if(err) {
                    res.status(500).json(err);
                } else if(!kpi) {
                    res.status(404).json({message: "Kpi not found or not authorized"});
                } else {
                    kpi.remove(function (err) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            res.status(200).json(kpi);
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
    getKpis: function (req, res) {
        if (req.isAuthenticated()) {

            Kpi.find({$or:[ {'userId':req.user._id}, {'official':true} ]}).lean().exec(function(err, kpis) {      
                if (err) {
                    res.json(500, err);
                } else {

                    _.each(kpis, function(kpi) {
                        if(kpi.userId.equals(req.user._id)) {
                            kpi.canDelete = true;
                        }

                    });
                    
                    res.json(200, kpis);
                    
                }
            });

        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getKpi: function (req, res) {

        var kpiId = req.params.kpiId || 'dummy id';
        
        if (req.isAuthenticated()) {

            Kpi.findById(kpiId, function (err, kpi) {
                if (err) {
                    res.json(500, err);
                } else if(!kpi) {
                    res.json(404, {message: "Kpi not found"});
                } else {
                    res.json(200, kpi);
                }
            });
            
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    }
};
module.exports = kpi;