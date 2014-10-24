var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var fs = require('fs');
var User = mongoose.model('User');
var Process = mongoose.model('Process');

var exportFile = {
    generateEcodistFile: function(req, res) {
      var processId;
        
      if(req.isAuthenticated()) {
        processId = req.user.activeProcessId || 'dummyId';
        Process.findById(processId, function(err, process) {
          if(err) {
            res.status(500).json(err);
          } else {
            var activeProcessTitle = process.title || 'noname';

            // TODO: handle other types of strange strings
            activeProcessTitle = activeProcessTitle.split(' ').join('-'); 

            var outputFilename = './export/' + activeProcessTitle + '.ecodist';

            fs.writeFile(outputFilename, JSON.stringify({process: process}, null, 4), function(err) {
                if(err) {
                  res.status(500).json(err);
                } else {
                  res.status(200).json({title: activeProcessTitle});
                }
            });
          }
        })
      } else {
        res.status(401).json({message: "Not authenticated"});
      }
    }
};
module.exports = exportFile;