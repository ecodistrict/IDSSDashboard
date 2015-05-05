var express = require('express');
    http = require('http'),
    path = require('path'),
    app = module.exports = express();

var port = 4570;
var httpServer = http.createServer(app);
var imb = require('../../../../lib/imb.js');

var moduleId = "mcmsmv";
var kpiId = "mcmsmv";

var imbConnection = new imb.TIMBConnection();
imbConnection.connect('vps17642.public.cloudvps.com', 4000, 1234, 'mcmsmv', 'ecodistrict');
var messageSub = imbConnection.subscribe('modules', true);

var sendDashboard = function(requestObj) {
  var request = JSON.stringify(requestObj).toString();
  var message = imbConnection.publish('dashboard', true);
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
  "method": "getModules",
  "type": "response",
  "name": "MCMSMV",
  "moduleId": moduleId,
  "description": "This module tests the MCMSMV functionality",
  "kpiList": [kpiId]
};

// selectModel response
// the keys in inputSpecification has been made unique for testing purposes
// this module does not have an input spec?
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
// this module does not have a result?
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
  if(message.method === 'getModules') {
    console.log('getModules');
    sendDashboard(moduleDefinition);
  } else if(message.method === 'selectModel') {
    console.log('selectModel');
    console.log(message);
    if(message.moduleId === moduleId) {
      moduleInput.variantId = message.variantId;
      sendDashboard(moduleInput); 
    }
  } else if(message.method === 'mcmsmv') {
    //if(message.kpiId === kpiId) {
      console.log(message);
      // startModel response
      var mcmsmv = {
        method: 'mcmsmv',
        type: 'response',
        moduleId: moduleId,
        status: 'success',
        userId: message.userId
      };
      sendDashboard(mcmsmv);
    //}
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
