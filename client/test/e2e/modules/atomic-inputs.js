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
imbConnection.connect('imb.lohman-solutions.com', 4000, 1234, 'atomicInputs', 'ecodistrict');
var messageSub = imbConnection.subscribe('modelsTEST', true);

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

// getModel response
var moduleDefinition = {
  "method": "getModels",
  "type": "response",
  "name": "Atomic inputs",
  "moduleId": moduleId,
  "description": "This module tests the atomic inputs",
  "kpiList": [kpiId]
};

// selectModel response
// the keys in inputSpecification has been made unique for testing purposes
var moduleInput = {
    "method": "selectModel",
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

// startModel response
var startModel = {
  "method": "startModel",
  "type": "response",
  "moduleId": moduleId
};

// modelResult test
var modelResult = {
    "method": "modelResult",
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
  if(message.method === 'getModels') {
    console.log('getModels');
    sendDashboard(moduleDefinition);
  } else if(message.method === 'selectModel') {
    console.log('selectModel');
    console.log(message);
    if(message.moduleId === moduleId) {
      moduleInput.variantId = message.variantId;
      sendDashboard(moduleInput); 
    }
  } else if(message.method === 'startModel') {
    if(message.moduleId === moduleId) {
      // first send status that model started
      startModel.status = 'processing'; 
      startModel.kpiId = message.kpiId;
      startModel.variantId = message.variantId;
      sendDashboard(startModel);
      // after calculating, send output
      modelResult.kpiId = message.kpiId;
      modelResult.variantId = message.variantId;
      modelResult.moduleId = moduleId;
      console.log(modelResult);
      sendDashboard(modelResult);
      // also send new status
      startModel.status = 'success';
      sendDashboard(startModel);
    }
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
