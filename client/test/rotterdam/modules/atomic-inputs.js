var express = require('express');
    http = require('http'),
    path = require('path'),
    app = module.exports = express();

var port = 4569;
var httpServer = http.createServer(app);
var imb = require('../../../../lib/imb.js');

var moduleId = "atomic-inputs";
var kpiId = "atomic-test";

var imbConnection = new imb.TIMBConnection();
imbConnection.connect('vps17642.public.cloudvps.com', 4000, 1234, 'atomicInputs', 'ecodistrict');
var messageSub = imbConnection.subscribe('modulesTEST', true);

var sendDashboard = function(requestObj) {
  var request = JSON.stringify(requestObj).toString();
  var message = imbConnection.publish('dashboardTEST', true);
  var messageByteLength = Buffer.byteLength(request);
  var eventPayload = new Buffer(4+messageByteLength);
  var offset = 0;
  eventPayload.writeInt32LE(messageByteLength, offset);
  offset += 4;
  eventPayload.write(request, offset);
  message.normalEvent(imb.ekNormalEvent, eventPayload);
};

// getModule response
var moduleDefinition = {
  "method": "getModules",
  "type": "response",
  "name": "Atomic inputs",
  "moduleId": moduleId,
  "description": "This module tests the atomic inputs",
  "kpiList": [kpiId]
};

// selectModule response
// the keys in inputSpecification has been made unique for testing purposes
var moduleInput = {
    "method": "selectModule",
    "type": "response",
    "moduleId": moduleId,
    "kpiId": kpiId,
    "inputSpecification": {
      "name-1": { "type": "text", "label": "Name", "order": -1 },
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
  "method": "startModule",
  "type": "response",
  "moduleId": moduleId
};

// moduleResult test
var moduleResult = {
    "method": "moduleResult",
    "type": "result",
    "outputs": [{
      "type": "kpi",
      "value": 7.9879,
      "info": "Mean value.."
    },{
      "type": "kpi-list",
      "label": "Buildings and their heating systems",
      "value": [
        {
          "kpiValue": 7.34534543,
          "name": "Building 1"
        },
        {
          "kpiValue": 8.7543453,
          "name": "Building 2"
        }
      ]
    }] 
};

messageSub.onNormalEvent = function(eventDefinition, eventPayload) {
  var offset = 0;
  var length = eventPayload.readInt32LE(offset);
  offset += 4;
  var message = JSON.parse(eventPayload.toString('utf8', offset, offset + length));
  if(message.method === 'getModules') {
    console.log('getModules');
    sendDashboard(moduleDefinition);
  } else if(message.method === 'selectModule') {
    console.log('selectModule');
    console.log(message);
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
      console.log(moduleResult);
      sendDashboard(moduleResult);
      // also send new status
      startModule.status = 'success';
      sendDashboard(startModule);
    }
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
