var express = require('express');
var http = require('http');
var fs = require('fs');   
var _ = require('underscore');  
var util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var app = module.exports = express();
var request = require('request');

var port = 4567;
var httpServer = http.createServer(app);
var imb = require('../../lib/imb.js');

var moduleId = "geojson";
var kpi1 = "test1";
var kpi2 = "test2";

var imbConnection = new imb.TIMBConnection(imb.imbDefaultHostname, imb.imbDefaultTLSPort, 10, "dashboard testmodule", imb.imbDefaultPrefix, false, 
    "../../cert/client-eco-district.pfx", "&8dh48klosaxu90OKH", "../../cert/root-ca-imb.crt");

imbConnection.on("onUniqueClientID", function (aUniqueClientID, aHubID) {
    console.log('private event name: ' + imbConnection.privateEventName);
    console.log('monitor event name: ' + imbConnection.monitorEventName);
});

imbConnection.on("onDisconnect", function (obj) {
    console.log("disonnected");
});

var frameworkPub = imbConnection.publish("dashboardTEST");
var frameworkSub = imbConnection.subscribe("modulesTEST");

frameworkPub.onString = function(aEventEntry, aString) {
  console.log(aEventEntry, aString);
};

var sendDashboard = function(requestObj) {
  frameworkPub.signalString(JSON.stringify(requestObj).toString());
};

// getModule response
var moduleDefinition = {
  "method": "getModules",
  "type": "response",
  "name": "Geojson test module",
  "moduleId": moduleId,
  "description": "This module tests the geojson input",
  "kpiList": [kpi1, kpi2]
};

var geojsonInputSpecification = {
  "type": "geojson",
  "label": "Define amenities with GeoJSON geometries"
};

// selectModule response
var moduleInput1 = {
    "method": "selectModule",
    "type": "response",
    "moduleId": moduleId,
    "kpiId": kpi1,
    "inputSpecification": {
      "buildings": geojsonInputSpecification,
      "district": {
        "type": "district-polygon",
        "projection": "EPSG:3857"
      },
      "alternative": {
        "type": "select",
        "options": [{
          "value": "more",
          "label": "More park area"
        }, {
          "value": "default",
          "label": "No change"
        }, {
          "value": "less",
          "label": "Less park area"
        }],
        "label": "Source",
        "value": "default"
      }
    }
};

// selectModule response
var moduleInput2 = {
    "method": "selectModule",
    "type": "response",
    "moduleId": moduleId,
    "kpiId": kpi2,
    "inputSpecification": {
      "buildings": geojsonInputSpecification,
      "district": {
        "type": "district-polygon",
        "projection": "EPSG:3857"
      },
      "alternative": {
        "type": "select",
        "options": [{
          "value": "more",
          "label": "More park area"
        }, {
          "value": "default",
          "label": "No change"
        }, {
          "value": "less",
          "label": "Less park area"
        }],
        "label": "Source",
        "value": "default"
      }
    }
};

// moduleResult test
var moduleResult = {
    "method": "moduleResult",
    "type": "result"
};

frameworkSub.onString = function(aEventEntry, aString) {
  var message = JSON.parse(aString);
  console.log(message["method"]);
  if(message.method === 'getModules') {
    sendDashboard(moduleDefinition);
  } else if(message.method === 'selectModule') {
    console.log(message);
    if(message.moduleId === moduleId) {
      
      if(message.kpiId === 'test1') {
        moduleInput1.variantId = message.variantId;
        sendDashboard(moduleInput1); 
      } else if(message.kpiId === 'test2') {
        moduleInput2.variantId = message.variantId;
        sendDashboard(moduleInput2); 
      } 
    }
  } else if(message.method === 'startModule') {
    if(message.moduleId === moduleId) {
      var buildings = message.inputs.buildings.value;
      var total = 0, count = 1, average;
      var alternative = message.inputs.alternative.value;
      var factor = alternative === 'more' ? 0.75 : alternative === 'less' ? 1.25 : 1;

      _.each(buildings.features, function(feature) {
        var value;
        if(feature.properties) {
          factor = factor || 1;
          value = 100 * factor;
          feature.properties.kpiValue = value;
          total += value;
          count++;
        }
      });

      average = Math.round(total/count);

      // after calculating, send output
      moduleResult.kpiId = message.kpiId;
      moduleResult.variantId = message.variantId;
      moduleResult.moduleId = moduleId;
      moduleResult.userId = message.userId;
      moduleResult.status = "success";
      moduleResult.outputs = [{
        type: "kpi",
        value: average
      },{
        type: "geojson",
        value: message.inputs.buildings.value
      }];

      sendDashboard(moduleResult);
    }
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
