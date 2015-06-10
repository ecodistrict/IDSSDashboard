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

// getModule response
var moduleDefinition = {
  method: "getModules",
  type: "response",
  name: "Dashboard test module",
  moduleId: moduleId,
  description: "This is a test module for the dashboard",
  kpiList: [kpi]
};

var geojsonInputSpecification = {
  "type": "geojson",
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
};

// selectModule response
var moduleInput = {
    "method": "selectModule",
    "type": "response",
    "moduleId": moduleId,
    "kpiId": kpi,
    "inputSpecification": {
      "buildings": geojsonInputSpecification,
      "district": {
        "type": "district-polygon",
        "projection": "EPSG:3857"
      }, 
      "name-1": { "type": "text", "label": "Name", "order": -1 },
      "include": { "type": "checkbox", "label": "Include", "order": 2 },
      "shoe-size-1": { "type": "number", "label": "Shoe size" },
      "shoe-brand": { "type": "text", "label": "Shoe brand" },
      "cheese-type": {
        "label": "Cheese type",
        "type": "select",
        "value": "brie-cheese",
        "options": [
          {
            "value": "alp-cheese",
            "label": "Alpk\u00e4se"
          },
          {
            "value": "edam-cheese",
            "label": "Edammer"
          },
          {
            "value": "brie-cheese",
            "label": "Brie"
          }
        ]
      },
      "personal-data": {
        "type": "inputGroup",
        "label": "Personal data",
        "inputs": {
          "name-2": {
            "type": "text",
            "label": "Your name"
          },
          "shoe-size-2": {
            "value": 42,
            "type": "number",
            "label": "Your shoe size"
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

frameworkPub.signalString(JSON.stringify({method: 'getModules-test1'}).toString());
frameworkPub.signalString(JSON.stringify({method: 'getModules-test2'}).toString());

frameworkSub.onString = function(aEventEntry, aString) {
  
  var message = JSON.parse(aString);
  console.log(message["method"]);

  if(message.method === 'getModules') {
    frameworkPub.signalString(JSON.stringify(moduleDefinition).toString());
  } else if(message.method === 'selectModule') {
    if(message.moduleId === moduleId) {
      moduleInput.variantId = message.variantId;
      frameworkPub.signalString(JSON.stringify(moduleInput).toString());
    }
  } else if(message.method === 'startModule') {
    if(message.moduleId === moduleId) {
      // first send status that module started
      startModule.status = 'processing'; 
      startModule.kpiId = message.kpiId;
      startModule.variantId = message.variantId;
      startModule.userId = message.userId;
      frameworkPub.signalString(JSON.stringify(startModule).toString());
      // after calculating, send output
      moduleResult.kpiId = message.kpiId;
      moduleResult.variantId = message.variantId;
      moduleResult.moduleId = moduleId;
      moduleResult.userId = message.userId;
      moduleResult.status = "success";
      // some assumptions here!

      moduleResult.outputs = [{
        type: "kpi",
        value: 800,
        info: "Mean value.."
      },{
        type: "geojson",
        kpiProperty: "GEBHOOGTE",
        displayProperties: [{property: "GEBHOOGTE", label: "GEB HOOGTE"}],
        value: message.inputs.buildings.value
      }];
      frameworkPub.signalString(JSON.stringify(moduleResult).toString());
      
    }
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
