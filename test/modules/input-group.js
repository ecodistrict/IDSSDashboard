var express = require('express');
var http = require('http');
var fs = require('fs');   
var _ = require('underscore');  
var util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var app = module.exports = express();
var request = require('request');

var port = 4569;
var httpServer = http.createServer(app);
var imb = require('../../lib/imb.js');

var moduleId = "test-input-group";
var kpi = "input-group";

var imbConnection = new imb.TIMBConnection();
imbConnection.connect('imb.lohman-solutions.com', 4000, 1234, 'testModuleInputGroup', 'ecodistrict');
var messageSub = imbConnection.subscribe('models', true);

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
  "method": "getModels",
  "type": "response",
  "name": "Input group test module",
  "id": moduleId,
  "description": "This module tests the input group-input",
  "kpiList": [kpi]
};

// selectModel response
var moduleInput = {
    "method": "selectModel",
    "type": "response",
    "moduleId": moduleId,
    "kpiAlias": kpi,
    "inputs": [
        {
            "type": "input-group",
            "label": "Group 1",
            "inputs": [
                {
                    "label": "Number between 50 and 100",
                    "type": "number",
                    "id": "num1",
                    "unit": "m",
                    "min": 50,
                    "max": 100,
                    "value": 75
                },
                {
                    "label": "Positive number",
                    "type": "number",
                    "id": "num2",
                    "unit": "m",
                    "min": 0,
                    "value": 25
                }
            ]
        },
        {
            "type": "input-group",
            "label": "Group 2",
            "inputs": [
                {
                    "label": "Just another number",
                    "type": "number",
                    "id": "num3",
                    "unit": "m",
                    "value": 15
                },
                {
                    "label": "This should be checked",
                    "type": "checkbox",
                    "id": "check1",
                    "value": true
                }
            ]
        },
        {
            "type": "input-group",
            "label": "Group 3",
            "inputs": [
                {
                    "label": "Label for this input text",
                    "type": "text",
                    "id": "text1",
                    "value": "Default text"
                }
            ]
        }
    ]
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
      "value": 5
    }] 
};

messageSub.onNormalEvent = function(eventDefinition, eventPayload) {
  var offset = 0;
  var length = eventPayload.readInt32LE(offset);
  offset += 4;
  var message = JSON.parse(eventPayload.toString('utf8', offset, offset + length));
  if(message.method === 'getModels') {
    sendDashboard(moduleDefinition);
  } else if(message.method === 'selectModel') {
    if(message.moduleId === moduleId) {
      moduleInput.variantId = message.variantId;
      sendDashboard(moduleInput); 
    }
  } else if(message.method === 'startModel') {
    if(message.moduleId === moduleId) {
      console.log(message.inputs);
      // first send status that model started
      startModel.status = 'processing'; 
      startModel.kpiAlias = message.kpiAlias;
      startModel.variantId = message.variantId;
      sendDashboard(startModel);
      // after calculating, send output
      modelResult.kpiAlias = message.kpiAlias;
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
