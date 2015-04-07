var express = require('express');
var http = require('http');
var fs = require('fs');   
var _ = require('underscore');  
var util = require('util');
var bodyParser = require('body-parser');
var path = require('path');
var app = module.exports = express();
var request = require('request');

var port = 4570;
var httpServer = http.createServer(app);
var imb = require('../../lib/imb.js');

var moduleId = "list-input";
var kpi = "list";

var imbConnection = new imb.TIMBConnection();
imbConnection.connect('vps17642.public.cloudvps.com', 4000, 1234, 'testModuleListInput', 'ecodistrict');
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
  "method": "getModules",
  "type": "response",
  "name": "List input test module",
  "id": moduleId,
  "description": "This module tests the list input",
  "kpiList": [kpi]
};

// selectModel response
var moduleInput = {
    "method": "selectModel",
    "type": "response",
    "moduleId": moduleId,
    "kpiId": kpi,
    "inputs": [
        {
            "id": "time-frame",
            "type": "number",
            "label": "Time period for LCA calculation",
            "unit": "years",
            "min": 1,
            "value": 50
        },
        {
            "type": "list",
            "label": "Define buildings and their heating systems",
            "id": "buildings",
            "entity": "building",
            "inputs": [
                {
                  "id": "name",
                  "label": "Building name",
                  "type": "text"
                },
                {
                    "id": "heating-system",
                    "label": "Heating system",
                    "type": "select",
                    "options": [{
                      "id": "individual-gas-boilers",
                      "label": "Individual gas boilers"
                    }, {
                      "id": "district-heating",
                      "label": "District heating"
                    }, {
                      "id": "heat-pumps",
                      "label": "Individual heat pums"
                    }],
                    "value": "individual-gas-boilers"
                },
                {
                    "id": "energy-use",
                    "type": "number",
                    "label": "Annual energy use",
                    "unit": "kWh",
                    "min": 0,
                    "value": 5000
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
  console.log(message);
  if(message.method === 'getModules') {
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
      startModel.kpiId = message.kpiId;
      startModel.variantId = message.variantId;
      sendDashboard(startModel);
      // after calculating, send output
      modelResult.kpiId = message.kpiId;
      modelResult.variantId = message.variantId;
      modelResult.moduleId = moduleId;
      // modelResult.outputs = [];
      // var kpi = {type: "kpi", value: 0, info: "Some info here..."};
      // var kpiList = [];
      // _.each(message.inputs, function(input) {
      //   if(input.type === 'list') {
      //     _.each(input.value, function(post) {
      //       console.log(post);
      //       kpiList.push({
      //         "kpiValue": 6,
      //         "name": post.name
      //       });
      //       kpi.value = 6;
      //     });
      //   }
      // });
      // modelResult.outputs.push(kpi);
      // modelResult.outputs.push(kpiList);
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
