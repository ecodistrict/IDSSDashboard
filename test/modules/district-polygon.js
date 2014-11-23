var express = require('express');
var http = require('http');
var fs = require('fs');   
var _ = require('underscore');  
var util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var app = module.exports = express();
var request = require('request');

var port = 4568;
var httpServer = http.createServer(app);
var imb = require('../../lib/imb.js');

var moduleId = "test-district-input";
var kpi = "district-polygon";

var imbConnection = new imb.TIMBConnection();
imbConnection.connect('imb.lohman-solutions.com', 4000, 1234, 'testModuleDistrictPolygon', 'ecodistrict');
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
  "name": "District polygon test module",
  "id": moduleId,
  "description": "This module tests the district polygon input",
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
        "type": "district-polygon",
        "projection": "EPSG:3857"
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
      "type": "test",
      "value": "test"
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
      console.log(message);
      // first send status that model started
      startModel.status = 'processing'; 
      startModel.kpiAlias = message.kpiAlias;
      startModel.variantId = message.variantId;
      sendDashboard(startModel);
      // after calculating, send output
      modelResult.kpiAlias = message.kpiAlias;
      modelResult.variantId = message.variantId;
      modelResult.moduleId = moduleId;
      sendDashboard(modelResult);
      // also send new status
      startModel.status = 'success';
      sendDashboard(startModel);
    }
  }
};

httpServer.listen(port);
console.log('Module started on ' + port);
