var mongoose = require('mongoose');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var _ = require('underscore');
var fs = require('fs');
var Busboy = require('busboy');  
var StringDecoder = require('string_decoder').StringDecoder;

var importFile = {
    geojsonFileImport: function(req, res) {

      var busboy = new Busboy({ headers: req.headers });

      busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
        var decoder = new StringDecoder('utf8');
        var parsedData = '';

        file.on('data', function(data) {
          var textChunk = decoder.write(data);
          console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
          parsedData += textChunk;
        });

        file.on('end', function() {
          console.log('File [' + fieldname + '] Finished');
          parsedData = JSON.parse(parsedData);
          res.status(200).json({data: parsedData});
        });
      });

      req.pipe(busboy);
    }
};
module.exports = importFile;