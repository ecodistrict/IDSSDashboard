var pg = require('pg');
var conString = "postgres://ecodistrict:L6mtFrkTwvIIOYeXgTfO@vps17642.public.cloudvps.com:443/ecodistrict";

var dataModule = {

  getDistrictData: function(req, res) {
    pg.connect(conString, function(err, client, done) {
      if(err) {
        return res.status(500).json(err);
      }
      client.query("SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.bldg_lod1multisurface_value)::json As geometry, row_to_json((SELECT l FROM (SELECT attr_gml_id) As l)) As properties FROM bldg_building As lg   ) As f )  As fc;",
        function(err, result) {
          //call `done()` to release the client back to the pool
          done();

          if(err) {
            return res.status(500).json(err);
          }

          return res.status(200).json(result.rows[0]);
          
      });
    });
  }

};

module.exports = dataModule;