var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Kpi = mongoose.model('Kpi');

var kpi = {

    createKpi: function (req, res) {

        var newKpi;

        if (req.isAuthenticated()) {

            newKpi = new Kpi(req.body);

            // if not an official kpi, add to this user
            if(!req.body.official) {
                newKpi.userId = req.user._id;
            }

            newKpi.save(function(err) {
                if(err) {
                    res.json(500, err);
                } else {
                    res.json(200, newKpi);
                }
            });

        } else {
            res.json(401, {message: 'Not authenticated'});
        }

    },
    updateKpi: function (req, res) {

        var kpiId = req.body._id;
        if (req.isAuthenticated()) {

            Kpi.findOne({userId: req.user.id, _id: kpiId}, function(err, kpi) {
                if(err) {
                    res.json(500, err)
                } else if(!kpi) {
                    res.json(404, {message: "Kpi was not found"});
                } else {

                    // what to update?

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
        if (req.isAuthenticated()) {
            res.json(200, {message: 'Not implemented'});
        } else {
            res.json(401, {
                message: "Not authenticated"
            });
        }
    },
    getKpis: function (req, res) {
        if (req.isAuthenticated()) {

            // first get user kpis
            Kpi.find({userId: req.user._id}, function(err, userKpis) {
                if (err) {
                    res.json(500, err);
                } else {
                    // then official kpis
                    Kpi.find({official: true}, function(err, officialKpis) {
                        if (err) {
                            res.json(500, err);
                        } else {
                            userKpis = userKpis.concat(officialKpis);
                            res.json(200, userKpis);
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