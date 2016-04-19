var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var Case = mongoose.model('Case');
var User = mongoose.model('User');
var Variant = mongoose.model('Variant');

var ID_PREFIX = 'id_'; // used for prefix on case, could be used in mongoose middleware if upgrading 

function getCases(req, res) {
    _getCases(req.user._id, function(err, cases) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(cases);
    });
}

function getCaseById(req, res) {
    var caseId = req.params.caseId || 'dummyId',
        userId = req.user._id;
    _getCaseById(caseId, userId, function(err, foundCase) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(foundCase);
    });
}

function getActiveCase(req, res) {
    _getActiveCase(req.user._id, function(err, activeCase) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(activeCase);
    });
}

function createCase(req, res) {
    _createCase(req.user._id, function(err, createdCase) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(createdCase);
    });
}

function updateCase(req, res) {
    var caseData = req.body;
    _updateCase(req.user._id, caseData, function(err, updatedCase) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(updatedCase);
    });
}

function deleteCase(req, res) {
    var caseId = req.params.caseId || 'dummyId';
    _deleteCase(req.user._id, caseId, function(err, createdCase) {
        if(err) {
            return res.status(500).json(err);
        }
        return res.status(200).json(createdCase);
    });
}

function _getCases(userId, cb) {

    Case.find({userId: userId}, function(err, cases) {
        if (err) {
            cb(err);
        } else {
            cases.forEach(function(c) {
                c._id = ID_PREFIX + c._id
            })
            cb(null, cases);
        }
    });

}

function _getCaseById(caseId, userId, cb) {
    // if userId was given, set this case to active
    userId = userId || false;
    console.log(caseId);
    if(caseId.indexOf(ID_PREFIX) !== -1) {
        caseId = caseId.substring(3);
    }
    console.log(caseId);
    Case.findById(caseId, function (err, foundCase) {
        if (err) {
            cb(err);
        } else if(!foundCase) {
            cb({message: "Process not found"});
        } else {

            foundCase._id = caseId;

            if(userId) {
                User.findById(userId, function(err, user) {
                    if(err) {
                        cb(err);
                    } else if(!user) {
                        cb({message: "User not found"});
                    } else {
                        user.activeCaseId = caseId;
                        user.save(function(err) {
                            if(err) {
                                cb(err);
                            } else {
                                cb(null, foundCase);
                            }
                        });
                    }

                });
            } else {
                cb(null, foundCase);
            }
        }
    });
}

function _getActiveCase(userId, cb) {

    User.findById(userId, function(err, user) {
        if(err) {
            cb(err);
        } else if(!user) {
            cb({message: 'User not found'});
        } else {
            if(!user.activeCaseId) {
                cb(null, {message: 'Active case id not set'});
            } else {
                var caseId = user.activeCaseId ? user.activeCaseId.toString() : null;
                if( caseId && caseId.indexOf(ID_PREFIX) !== -1) {
                    caseId = caseId.substring(3);
                }
                Case.findById(user.activeCaseId, function(err, activeCase) {
                    if(err) {
                        cb(err);
                    } else if(!activeCase) {
                        cb(null, {});
                    } else {
                        activeCase._id = ID_PREFIX;
                        cb(null, activeCase);
                    }
                });
            }
        }
    });
}

function _createCase(userId, cb) {

    var caseData = {
        userId: userId,
        confirmed: false
    };

    User.findById(userId, function(err, user) {
        if(err) {
            cb(err);
        } else {
            var newCase = new Case(caseData);

            newCase.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    newCase._id = ID_PREFIX + newCase._id;
                    cb(null, newCase);
                }
            });

        }
    });
}

function _updateCase(userId, caseData, cb) {

    if(caseData_id.indexOf(ID_PREFIX)) {
        caseData_id = caseData_id.substring(3);
    }

    Case.findOne({userId: userId, _id: caseData._id}, function(err, foundCase) {
        if(err) {
            cb(err)
        } else if(!foundCase) {
            cb({message: "Case was not found"});
        } else {

            if(caseData.title) {
                foundCase.title = caseData.title;
            }
            if(caseData.description) {
                foundCase.description = caseData.description;
            }

            if(caseData.kpiList) {
                foundCase.kpiList = caseData.kpiList;
            }

            if(caseData.districtPolygon) {
                foundCase.districtPolygon = caseData.districtPolygon;
            }

            if(caseData.kpiValues) {
                foundCase.kpiValues = caseData.kpiValues;
            }

            if(caseData.kpiDisabled) {
                foundCase.kpiDisabled = caseData.kpiDisabled;
            }
            
            foundCase.dateModified = new Date();
            
            foundCase.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, foundCase);
                }
            });
                  
        }
    });
    
}

function updateKpiValue(userId, caseId, caseData, cb) {

    if(caseData_id.indexOf(ID_PREFIX)) {
        caseData_id = caseData_id.substring(3);
    }

    Case.findOne({userId: userId, _id: caseId}, function(err, foundCase) {
        if(err) {
            cb(err)
        } else if(!foundCase) {
            cb({message: "Case was not found"});
        } else {

            if(typeof caseData.kpiValue == 'number' && caseData.kpiId) {
                foundCase.kpiValues = foundCase.kpiValues || {};
                foundCase.kpiValues[caseData.kpiId] = caseData.kpiValue;

                foundCase.markModified('kpiValues');

            }   

            foundCase.dateModified = new Date();
            
            foundCase.save(function(err) {
                if(err) {
                    cb(err);
                } else {
                    cb(null, foundCase);
                }
            });
                  
        }
    });
    
}

function _deleteCase (userId, caseId, cb) {

    if(caseId.indexOf(ID_PREFIX) !== -1) {
        caseId = caseId.substring(3);
    }
    
    Case.findOne({_id: caseId, userId: userId}, function(err, foundCase) {
        if(err) {
            cb(err);
        } else if(!foundCase) {
            cb({message: "Process not found or not authorized"});
        } else {
            // Delete variants
            Variant.find({caseId: foundCase._id}).remove(function(err) {
                if(err) {
                    cb(err);
                } else {
                    // Delete stakeholders
                    User.find({facilitatorId: userId, activeCaseId: caseId}).remove(function(err) {
                        if(err) {
                            cb(err);
                        } else {
                            foundCase.remove(function (err) {
                                if (err) {
                                    cb(err);
                                } else {
                                    User.findById(userId, function(err, user) {
                                        if(err) {
                                            cb(err);
                                        } else {
                                            if(user.activeCaseId && user.activeCaseId.equals(caseId)) {
                                                user.activeCaseId = null;
                                            }
                                            user.save(function(err) {
                                                if(err) {
                                                    cb(err);
                                                } else {
                                                    cb(null, foundCase);
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
                    
        }
    });
    
}
        
// we expose "private" functions because of the internal IMB messaging
module.exports = {
    getCases: getCases,
    _getCaseById: _getCaseById,
    _getCases: _getCases,
    getCaseById: getCaseById,
    getActiveCase: getActiveCase,
    createCase: createCase,
    updateCase: updateCase,
    updateKpiValue: updateKpiValue, // considered private and unsafe, but.. needed from framework
    deleteCase: deleteCase
};