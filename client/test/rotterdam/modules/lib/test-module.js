var express = require('express');
    http = require('http'),
    path = require('path'),
    app = module.exports = express();

// TODO : create test module class with kind of this data below

var httpServer = http.createServer(app);
var imb = require('../../../../../lib/imb.js');
var imbConnection = new imb.TIMBConnection();
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

var handleMessages;

var setHandleMessages = function(h) {
  handleMessages = h;
};

messageSub.onNormalEvent = function(eventDefinition, eventPayload) {
  var offset = 0,
      length = eventPayload.readInt32LE(offset);
  offset += 4;
  var message = JSON.parse(eventPayload.toString('utf8', offset, offset + length));
  if(handleMessages[message.method]) {
    handleMessages[message.method]();
  }
};

module.exports = {
  connection: imbConnection,
  server: httpServer,
  setHandleMessages: setHandleMessages
}
