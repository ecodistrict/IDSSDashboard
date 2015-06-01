var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var KpiRecord = mongoose.model('KpiRecord');

var doSaveKpiRecord = function(kpiRecord, cb) {

    KpiRecord.findOne({variantId: kpiRecord.variantId, alias: kpiRecord.alias, userId: kpiRecord.userId}, function(err, existingRecord) {
                    
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

            if(kpiRecord.value) {
                existingRecord.value = kpiRecord.value;
            }

            if(kpiRecord.status) {
                existingRecord.status = kpiRecord.status;
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
            alias: req.params.kpiAlias,
            userId: req.params.userId
        };
        
        if (req.isAuthenticated()) {

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

    saveKpiRecord: function(req, res) {

        var kpiRecord = req.body;

        if (req.isAuthenticated()) {

            if(kpiRecord.variantId && kpiRecord.alias) {

                if(!kpiRecord.userId) {
                    kpiRecord.userId = req.user._id;
                }

                doSaveKpiRecord(kpiRecord, function(err, savedRecord) {

                    if(err) {
                        res.json(500, err);
                    } else {
                        res.json(200, savedRecord);
                    }

                });
                
            } else {
                res.status(400).json({message: "input data missing"});
            }

        } else {
            res.status(401).json({message: "Not authenticated"});
        }

    }
};
module.exports = kpiRecord;