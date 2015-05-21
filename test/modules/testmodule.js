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

var moduleId = "dashboard-testmodule";
var kpi = "dashboard-test";

var sendDashboard = function(requestObj) {
  var request = JSON.stringify(requestObj).toString();
  messageSub.signalString(request);
};

// getModule response
var moduleDefinition = {
  method: "getModules",
  type: "response",
  name: "Dashboard test module",
  moduleId: moduleId,
  description: "This is a test module for the dashboard",
  kpiList: [kpi]
};

// selectModule response
var moduleInput = {
    method: "selectModule",
    type: "response",
    moduleId: moduleId,
    kpiId: kpi,
    inputSpecification: {
      "buildings": {
        "type": "geojson",
        "geometryObject": "polygon",
        "label": "Define buildings with GeoJSON polygon geometries",
        "inputs": {
            "num-storeys": {
              "type": "number",
              "label": "Number of storeys",
              "min": 1,
              "max": 10,
              "value": 3
            },
            "glazing": {
                "type": "number",
                "label": "Glazing area",
                "unit": "%",
                "min": 1,
                "max": 100,
                "value": 40
            }, 
            "year-of-construction": {
                "type": "number",
                "label": "Year of construction",
                "min": 1400,
                "max": 2100,
                "value": 1930
            }, 
            "usage": {
                "type": "select",
                "options": [{
                  "value": "detached",
                  "label": "Detached house"
                }, {
                  "value": "block-of-flats",
                  "label": "Block of flats"
                }, {
                  "value": "office",
                  "label": "Office"
                }],
                "label": "Usage",
                "value": "block-of-flats"
            }, 
            "building-type": {
                "type": "select",
                "options": [{
                  "value": "concrete",
                  "label": "Concrete"
                }, {
                  "value": "wood",
                  "label": "Wooden"
                }, {
                  "value": "brick",
                  "label": "Brick"
                }],
                "label": "Building type",
                "value": "wood"
            }
        }
      }
    }
};

// startModule response
var startModule = {
  method: "startModule",
  type: "response",
  moduleId: moduleId
};

// moduleResult test
var moduleResult = {
    method: "moduleResult",
    type: "result"
};

var imbConnection = new imb.TIMBConnection(imb.imbDefaultHostname, imb.imbDefaultTLSPort, 10, "dashboard-testmodule", imb.imbDefaultPrefix, false, 
    "../../cert/client-eco-district.pfx", "&8dh48klosaxu90OKH", "../../cert/root-ca-imb.crt");

imbConnection.on("onUniqueClientID", function (aUniqueClientID, aHubID) {
    console.log('private event name: ' + imbConnection.privateEventName);
    console.log('monitor event name: ' + imbConnection.monitorEventName);
});

imbConnection.on("onDisconnect", function (obj) {
    console.log("disonnected");
});

var frameworkSocket = imbConnection.subscribe("framework");

frameworkSocket.onString = function(aEventEntry, aString) {
  
  console.log(aString);
  var message = aString;
  console.log(message);

  if(message.method === 'getModules') {
    console.log('getModules');
    frameworkSocket.signalString(moduleDefinition);
  } else if(message.method === 'selectModule') {
    if(message.moduleId === moduleId) {
      moduleInput.variantId = message.variantId;
      sendDashboard(moduleInput); 
    }
  } else if(message.method === 'startModule') {
    if(message.moduleId === moduleId) {
      // first send status that module started
      startModule.status = 'processing'; 
      startModule.kpiId = message.kpiId;
      startModule.variantId = message.variantId;
      sendDashboard(startModule);
      // after calculating, send output
      moduleResult.kpiId = message.kpiId;
      moduleResult.variantId = message.variantId;
      moduleResult.moduleId = moduleId;
      // some assumptions here!

      console.log(message);
      moduleResult.outputs = [{
        "type": "kpi",
        "value": 7,
        "info": "Mean value.."
      },{
        "type": "kpi-list",
        "label": "Buildings and their heating systems",
        "value": [
          {
            "kpiValue": 7,
            "name": "Building 1"
          },
          {
            "kpiValue": 8,
            "name": "Building 2"
          }
        ]
      },{
        type: "geojson",
        kpiProperty: "GEBHOOGTE",
        displayProperties: [{property: "GEBHOOGTE", label: "GEB HOOGTE"}],
        value: message.inputs.buildings.value
      }];
      sendDashboard(moduleResult);
      // also send new status
      startModule.status = 'success';
      sendDashboard(startModule);
    }
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
