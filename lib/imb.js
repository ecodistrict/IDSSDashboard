// prerequisites
//  npm install bytebuffer
//  npm install uuid      

var ByteBuffer = require("bytebuffer");
// imb4 is little endian
ByteBuffer.DEFAULT_ENDIAN = ByteBuffer.LITTLE_ENDIAN;

var uuid = require('uuid'); // for creating guids/uuids

// guids/uuids are used as byte arrays of length 16
var empty_guid = new Buffer(Array(16));

// secure TLS connection
var tls = require('tls');
var fs = require('fs');

const imbMagic = 0xFE;

const imbDefaultPrefix = "ecodistrict";
const imbDefaultHostname = "vps17642.public.cloudvps.com";
const imbDefaultSocketPort = 4004;
const imbDefaultTLSPort = 4443;

const imbMinimumPacketSize = 16;
const imbMaximumPayloadSize = 10 * 1024 * 1024;

const imbEventNameSeperator = '.';
const imbEventFilterPostFix = '*';

const imbInvalidEventID = 0xFFFFFFFF;

const actionNew = 0;
const actionDelete = 1;
const actionChange = 2;

// client states
const icsUninitialized = 0;
const icsInitialized = 1;
const icsClient = 2;
const icsHub = 3;
const icsEnded = 4;
const icsTimer = 10;
const icsGateway = 100;

// imb command tags

const icehRemark = 1;                   // <string>

// subscribe/publish
const icehSubscribe = 2;                // <uint32: varint>
const icehPublish = 3;                  // <uint32: varint>
const icehUnsubscribe = 4;              // <uint32: varint>
const icehUnpublish = 5;                // <uint32: varint>
const icehSetEventIDTranslation = 6;    // <uint32: varint>
const icehEventName = 7;                // <string>
const icehEventID = 8;                  // <uint32: varint>

// connection
const icehUniqueClientID = 11;          // <guid>
const icehHubID = 12;                   // <guid>
const icehModelName = 13;               // <string>
const icehModelID = 14;                 // <int32: varint> ?
const icehReconnectable = 15;           // <bool: varint>
const icehState = 16;                   // todo:
const icehEventNameFilter = 17;         // todo:
const icehNoDelay = 18;                 // <bool: varint>
const icehClose = 21;                   // <bool: varint>
const icehReconnect = 22;               // <guid>

// standard event tags

// basic event tags
const icehIntString = 1;                // <varint>
const icehIntStringPayload = 2;         // <string>
const icehString = 3;                   // <string>
const icehChangeObject = 4;             // <int32: varint>
const icehChangeObjectAction = 5;       // <int32: varint>
const icehChangeObjectAttribute = 6;    // <string>

// stream
const icehStreamHeader = 7;             // <string> filename
const icehStreamBody = 8;               // <bytes>
const icehStreamEnd = 9;                // <bool> true: ok, false: cancel
const icehStreamID = 10;                // <id: bytes/string>

// protobuf wire types
const wtVarInt=0;                       // int32, int64, uint32, uint64, sint32, sint64, bool, enum
const wt64Bit=1;                        // double or fixed int64/uint64
const wtLengthDelimited=2;              // string, bytes, embedded messages, packed repeated fields
const wtStartGroup=3;                   // deprecated
const wtEndGroup=4;                     // deprecated
const wt32Bit=5;                        // float (single) or fixed int32/uint32


// ********************** low level byte buffers *******************************

// encode tag and wire type in protobuf varint unsigned
function bb_tag(aBuffer, aTag, aWireType) {
    aBuffer.writeVarint32(aTag << 3 | aWireType);
}

// varint but always 1 byte
function bb_tag_bool(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtVarInt);
    if (aValue)
        aBuffer.writeVarint32(1);
    else
        aBuffer.writeVarint32(0);
} 

// varint
function bb_tag_uint32(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtVarInt);
    aBuffer.writeVarint32(aValue);
}

// varint
function bb_tag_int32(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtVarInt);
    aBuffer.writeVarint32ZigZag(aValue);
} 

// varint
function bb_tag_uint64(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtVarInt);
    aBuffer.writeVarint64(aValue);
}

// varint
function bb_tag_int64(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtVarInt);
    aBuffer.writeVarint64ZigZag(aValue);
} 

// 4 byte
function bb_tag_single(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wt32Bit);
    aBuffer.writeFloat32(aValue);
}

// 8 byte
function bb_tag_double(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wt64Bit);
    aBuffer.writeFloat64(aValue);
}

// -> utf8 -> length delimited
function bb_tag_string(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtLengthDelimited);
    aBuffer.writeVString(aValue);
} 

// length delimited (length always 16 bytes)
// !! if not a guid an incorrect number of bytes is added and decoding will fail
function bb_tag_guid(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtLengthDelimited);
    aBuffer.writeVarint32(16); // guids are 16 bytes long
    aBuffer.append(aValue, encoding="binary");
}

// length delimited
function bb_tag_bytes(aBuffer, aTag, aValue) {
    bb_tag(aBuffer, aTag, wtLengthDelimited);
    aBuffer.writeVarint32(aValue.length); 
    aBuffer.append(aValue, encoding = "binary");
}

function bb_skip(aBuffer, aWireType) {
    switch (aWireType) {
        case wtVarInt:
            aBuffer.readVarint64();
            break;
        case wt32Bit:
            aBuffer.skip(4);
            break;
        case wt64Bit:
            aBuffer.skip(8);
            break;
        //case wtStartGroup:
        //case wtEndGroup:
        case wtLengthDelimited:
            var len = aBuffer.readVarint32();
            aBuffer.skip(len);
            break;
        default:
            throw new Error('invalid wire type: ' + aWireType);
    }
}

function bb_read_guid(aBuffer) {
    var len = aBuffer.readVarint32();
    if (len == 16) {
        guidBuffer = aBuffer.copy(begin = aBuffer.offset, end = aBuffer.offset + len);
        guidBytes = guidBuffer.toBuffer();
        aBuffer.skip(len);
        return guidBytes;
    }
    else
        throw new Error('invalid guid length in bb_read_guid: ' + len);
}


// ********************** low level wire command *******************************

function signalCommand(aSocket, aCommand) {
    var packet = new ByteBuffer();
    packet.writeByte(imbMagic);
    packet.writeVarint64ZigZag(-aCommand.limit);
    packet.append(aCommand.copy());
    if (packet.offset < imbMinimumPacketSize)
        packet.fill(0, end = imbMinimumPacketSize);
    packet.flip();
    var buffer = packet.toBuffer();
    aSocket.write(buffer);
}

function signalSubscribe(aSocket, aEventID, aEventName) {
    var command = new ByteBuffer();
    bb_tag_string(command, icehEventName, aEventName);
    bb_tag_uint32(command, icehSubscribe, aEventID);
    command.flip();
    signalCommand(aSocket, command);
}

function signalUnSubscribe(aSocket, aEventID) {
    var command = new ByteBuffer();
    bb_tag_uint32(command, icehUnsubscribe, aEventID);
    command.flip();
    signalCommand(aSocket, command);
}

function signalPublish(aSocket, aEventID, aEventName) {
    var command = new ByteBuffer();
    bb_tag_string(command, icehEventName, aEventName);
    bb_tag_uint32(command, icehPublish, aEventID);
    command.flip();
    signalCommand(aSocket, command);
}

function signalUnPublish(aSocket, aEventID) {
    var command = new ByteBuffer();
    bb_tag_uint32(command, icehUnpublish, aEventID);
    command.flip();
    signalCommand(aSocket, command);
}

function signalClientInfo(aSocket, aOwnerID, aOwnerName, aReconnectable, aEventNameFilter, aUniqueClientID) {
    var command = new ByteBuffer();
    bb_tag_string(command, icehModelName, aOwnerName);
    bb_tag_int32(command, icehModelID, aOwnerID);
    bb_tag_uint32(command, icehState, icsClient);
    bb_tag_bool(command, icehReconnectable, aReconnectable);
    bb_tag_string(command, icehEventNameFilter, aEventNameFilter);
    bb_tag_guid(command, icehUniqueClientID, aUniqueClientID); // trigger
    command.flip();
    signalCommand(aSocket, command);
}

function signalEvent(aSocket, aEventID, aEvent) {
    var packet = new ByteBuffer();
    packet.writeByte(imbMagic);
    packet.writeVarint64ZigZag(aEvent.limit + 2); // 2 bytes extra for event id
    packet.writeUint16(aEventID); // fixed format Uint16
    packet.append(aEvent.copy());
    if (packet.offset < imbMinimumPacketSize)
        packet.fill(0, end = imbMinimumPacketSize);
    packet.flip();
    var buffer = packet.toBuffer();
    aSocket.write(buffer);
}

function signalChangeObject(aSocket, aEventID, aAction, aObjectID, aAttribute) {
    var event = new ByteBuffer();
    bb_tag_int32(event, icehChangeObjectAction, aAction);
    bb_tag_string(event, icehChangeObjectAttribute, aAttribute);
    bb_tag_int32(event, icehChangeObject, aObjectID);
    event.flip()
    signalEvent(aSocket, aEventID, event);
}

function SignalString(aSocket, aEventID, aPayload) {
    var event = new ByteBuffer();
    bb_tag_string(event, icehString, aPayload);
    event.flip()
    signalEvent(aSocket, aEventID, event);
}

function SignalIntString(aSocket, aEventID, aCommand, aPayload) {
    var event = new ByteBuffer();
    bb_tag_string(event, icehIntStringPayload, aPayload);
    bb_tag_int32(event, icehIntString, aCommand);
    event.flip()
    signalEvent(aSocket, aEventID, event);
}

function signalStream(aSocket, aEventID, aStreamName, aStream) {
    var event = new ByteBuffer();
    var streamID = new Buffer(16); 
    streamID = uuid.v4('binary');
    // header
    bb_tag_guid(event, icehStreamID, streamID);
    bb_tag_string(event, icehStreamHeader, aStreamName);
    event.flip()
    signalEvent(aSocket, aEventID, event);
    // stream body
    aStream.on('data', function (chunk) {
        event.clear();
        bb_tag_guid(event, icehStreamID, streamID);
        bb_tag_bytes(event, icehStreamBody, chunk);
        event.flip()
        signalEvent(aSocket, aEventID, event);
    });
    // stream end
    aStream.on('end', function () {
        event.clear();
        bb_tag_guid(event, icehStreamID, streamID);
        bb_tag_bool(event, icehStreamEnd, false);
        event.flip()
        signalEvent(aSocket, aEventID, event);
    });
}

// **************** the imb connection ********************

var util = require("util");
var EventEmitter = require("events").EventEmitter;

TIMBConnection = function (aRemoteHost, aRemotePort, aOwnerID, aOwnerName, aPrefix, aReconnectable, aPfxFile, aPassphrase, aRootCertFile) {
    var fSelf = this; // todo: work-a-round?
    
    // link event emitter
    EventEmitter.call(this);
    
    var fEventNames = [];
    var fEventTranslations = [];
    var fEventEntries = [];
    var fUniqueClientID = empty_guid;
    var fPrefix = aPrefix;
    var fEventNameFilter = "";
    
    // connect
    if (aPfxFile == "") {
        // standard socket TCP connection
        var fSocket = require("net").Socket();
        fSocket.connect(aRemotePort, aRemoteHost);
    }
    else {
        // secure TLS connection
        var options = {
            pfx: fs.readFileSync(aPfxFile),
            passphrase: aPassphrase,
            ca: [fs.readFileSync(aRootCertFile)], // only pem supproted?
            //checkServerIdentity: function (servername, cert) { return undefined; } 
        };

        var fSocket = tls.connect(aRemotePort, aRemoteHost, options, function () {
            console.log('client connected', fSocket.authorized ? 'authorized' : 'unauthorized');
        });
    }

    // link handlers on socket
    fSocket.on("data", onReadCommand);
    fSocket.on("end", handleDisconnect);
    
    // send client info
    signalClientInfo(fSocket, aOwnerID, aOwnerName, aReconnectable, "", empty_guid);
    
    function handleEvent(aEventID, aPayload) {
        var eventEntry = fEventEntries[aEventID];
        var eventName = fEventNames[aEventID];
        var shortEventName = eventName;
        var action = -1;
        var attributeName = "";
        var stringPayload = "";
        var streamID = null;
        if (eventName.toUpperCase().lastIndexOf((fPrefix + ".").toUpperCase(), 0) === 0)
            shortEventName = eventName.substring(fPrefix.length + 1);
        // process all data in payload
        while (aPayload.remaining() > 0) {
            var fieldinfo = aPayload.readVarint32();
            switch (fieldinfo) {
                // change object
                case (icehChangeObjectAction << 3) | wtVarInt:
                    action = aPayload.readVarint32ZigZag();
                    break;
                case (icehChangeObjectAttribute << 3) | wtLengthDelimited:
                    attributeName = aPayload.readVString();
                    break;
                case (icehChangeObject << 3) | wtVarInt:
                    var objectID = aPayload.readVarint32ZigZag();
                    if (eventEntry.onChangeObject != null)
                        eventEntry.onChangeObject(eventEntry, action, objectID, attributeName);
                    break;
                // string event
                case (icehString << 3) | wtLengthDelimited:
                    stringPayload = aPayload.readVString();
                    if (eventEntry.onString != null)
                        eventEntry.onString(eventEntry, stringPayload);
                    break;
                // int-string event
                case (icehIntString << 3) | wtVarInt:
                    intPayload = aPayload.readVarint32ZigZag();
                    if (eventEntry.onIntString != null)
                        eventEntry.onIntString(eventEntry, intPayload, stringPayload);
                    break;
                case (icehIntStringPayload << 3) | wtLengthDelimited:
                    stringPayload = aPayload.readVString();
                    break;
                // stream
                case (icehStreamHeader << 3) | wtLengthDelimited:
                    streamName = aPayload.readVString();
                    if (eventEntry.onStreamCreate != null) {
                        var streamStream = eventEntry.onStreamCreate(eventEntry, streamName);
                        if (eventEntry.streamDefinitions == null)
                            eventEntry.streamDefinitions = {};
                        if (streamStream != null)
                            eventEntry.streamDefinitions[streamID] = { name: streamName, stream: streamStream };
                    }
                    break;
                case (icehStreamBody << 3) | wtLengthDelimited:
                    var len = aPayload.readVarint32();
                    if (eventEntry.onStreamCreate != null && eventEntry.streamDefinitions != null) {
                        var streamDefinition = eventEntry.streamDefinitions[streamID];
                        if (streamDefinition != null)
                            streamDefinition.stream.write(aPayload.copy(begin = aPayload.offset, end = aPayload.offset + len).toBuffer());
                    }
                    aPayload.skip(len);
                    break;
                case (icehStreamEnd << 3) | wtVarInt:
                    var cancel = aPayload.readVarint32() != 0;
                    if (eventEntry.onStreamCreate != null && eventEntry.streamDefinitions != null) {
                        var streamDefinition = eventEntry.streamDefinitions[streamID];
                        if (streamDefinition != null) {
                            streamDefinition.stream.end();
                            if (eventEntry.onStreamEnd != null)
                                eventEntry.onStreamEnd(eventEntry, streamDefinition.stream, streamDefinition.name, cancel);
                            eventEntry.streamDefinitions[streamID] = null;
                        }
                    }
                    break;
                case (icehStreamID << 3) | wtLengthDelimited:
                    streamID = bb_read_guid(aPayload);
                    break;
                default:
                    // skip based on wire type
                    bb_skip(aPayload, fieldinfo & 7);
                    break;
            }
        }
    }

    function handleCommand(aPayload) {
        var eventName = "";
        var localEventID = imbInvalidEventID;
        // process all data in payload
        while (aPayload.remaining() > 0) {
            var fieldinfo = aPayload.readVarint32();
            switch (fieldinfo) {
                case (icehSubscribe << 3) | wtVarInt:
                    var remoteEventID = aPayload.readVarint32();
                    if (remoteEventID < fEventTranslations.length)
                        localEventID = fEventTranslations[remoteEventID];
                    else
                        localEventID = imbInvalidEventID;
                    // todo: HandleSubAndPub(icehSubscribe, localEventID, eventName);
                    break;
                case (icehPublish << 3) | wtVarInt:
                    var remoteEventID = aPayload.readVarint32();
                    if (remoteEventID < fEventTranslations.length)
                        localEventID = fEventTranslations[remoteEventID];
                    else
                        localEventID = imbInvalidEventID;
                    // todo: HandleSubAndPub(icehPublish, localEventID, eventName);
                    break;
                case (icehUnsubscribe << 3) | wtVarInt:
                    var remoteEventID = aPayload.readVarint32();
                    eventName = "";
                    if (remoteEventID < fEventTranslations.length)
                        localEventID = fEventTranslations[remoteEventID];
                    else
                        localEventID = imbInvalidEventID;
                    // todo: HandleSubAndPub(icehUnsubscribe, localEventID, eventName);
                    break;
                case (icehUnpublish << 3) | wtVarInt:
                    var remoteEventID = aPayload.readVarint32();
                    eventName = "";
                    if (remoteEventID < fEventTranslations.length)
                        localEventID = fEventTranslations[remoteEventID];
                    else
                        localEventID = imbInvalidEventID;
                    // todo: HandleSubAndPub(icehUnpublish, localEventID, eventName);
                    break;
                case (icehEventName << 3) | wtLengthDelimited:
                    eventName = aPayload.readVString();
                    break;
                case (icehEventID << 3) | wtVarInt:
                    localEventID = aPayload.readVarint32();
                    break;
                case (icehSetEventIDTranslation << 3) | wtVarInt:
                    var remoteEventID = aPayload.readVarint32();
                    // check and make room for event id
                    if (remoteEventID >= fEventTranslations.length) {
                        var preLength = fEventTranslations.length;
                        fEventTranslations.length = remoteEventID + 1;
                        for (var i = preLength; i < fEventTranslations.length - 1; i++)
                            fEventTranslations[i] = -1;
                    }
                    fEventTranslations[remoteEventID] = localEventID;
                    break;
                // connection
                case (icehNoDelay << 3) | wtVarInt:
                    var noDelayValue = aPayload.readVarint32() != 0;
                    // todo: setNoDelayOnConnection(noDelayValue);
                    break;
                case (icehClose << 3) | wtVarInt:
                    var closeState = aPayload.readVarint32();
                    // Close(false);
                    handleEndSession();
                    break;
                case (icehHubID << 3) | wtLengthDelimited:
                    fHubID = bb_read_guid(aPayload);
                    break;
                case (icehUniqueClientID << 3) | wtLengthDelimited:
                    fUniqueClientID = bb_read_guid(aPayload);
                    fSelf.emit("onUniquClientID", fSelf.fUniqueClientID, fHubID);
                    break;
                case (icehRemark << 3) | wtLengthDelimited:
                    var headerLine = aPayload.readVString();
                    break;
                case (icehEventNameFilter << 3) | wtLengthDelimited:
                    fEventNameFilter = aPayload.readVString();
                    break;
                default:
                    // skip based on wire type
                    bb_skip(aPayload, fieldinfo & 7);
                    break;
            }
        }
        //else heart beat
    }    
    
    var fBuffer = new ByteBuffer(capacity=0);

    function onReadCommand(aNewData) {
        // add new data to existing buffer
        fBuffer.offset = fBuffer.limit;
        fBuffer.limit = fBuffer.offset + aNewData.length;
        fBuffer.append(aNewData, encoding="binary");
        fBuffer.flip();
        // try to process packets in buffer
        while (fBuffer.remaining() >= imbMinimumPacketSize) {
            // store the assumed start of the packet
            var startOfPacket = fBuffer.offset;
            var magic = fBuffer.readUint8();
            if (magic == imbMagic) {
                var size = fBuffer.readVarint32ZigZag();
                if (size > 0) {
                    // event
                    if (size <= fBuffer.remaining()) {
                        // we can read this event
                        var remoteEventID = fBuffer.readUint16(); //  fixed length event id
                        var payload = fBuffer.slice(fBuffer.offset, fBuffer.offset + size - 2);
                        // translate remote event id to local event id
                        if (remoteEventID < fEventTranslations.length) {
                            var localEventID = fEventTranslations[remoteEventID];
                            handleEvent(localEventID, payload);
                        }
                        fBuffer.skip(size - 2);
                        if (fBuffer.offset - startOfPacket < imbMinimumPacketSize)
                            fBuffer.offset = startOfPacket + imbMinimumPacketSize;
                    }
                    else {
                        // we cannot read this event so restore state and wait for more data
                        fBuffer.offset = startOfPacket;
                        break;
                    }
                }
                else {
                    // command
                    size = -size;
                    if (size <= fBuffer.remaining()) {
                        // we can read this command
                        var payload = fBuffer.slice(fBuffer.offset, fBuffer.offset + size);
                        handleCommand(payload);
                        fBuffer.skip(size);
                        if (fBuffer.offset - startOfPacket < imbMinimumPacketSize)
                            fBuffer.offset = startOfPacket + imbMinimumPacketSize;
                    }
                    else {
                        // we cannot read this command so restore state and wait for more data
                        fBuffer.offset = startOfPacket;
                        break;
                    }
                }
            }
            else {
                // no magic, try next byte
                console.log("## invalid magic: " + magic);
            }
        }
        if (fBuffer.offset > 0) {
            // remove processed data
            fBuffer.compact();
        }
    }

    function handleEndSession() {
        // todo: handle end of session received from hub
    }
    
    function handleDisconnect() {
        fSelf.emit("onDisconnect", fSelf);
    }

    function eventEntry(aEventID, aEventName) {
        
        // define event
        this.eventName = aEventName;
        this.eventID = aEventID;
        
        this.subscribed = false;
        this.published = false;

        // stream cache
        this.streamDefinitions = null;
        
        // event handlers
        // todo: rewrite to emitter?
        this.onChangeObject = null;
        this.onIntString = null;
        this.onString = null;
        this.onStreamCreate = null;
        this.onStreamEnd = null;
        
        this.autoPublish = function () {
            if (!this.published) {
                signalPublish(fSocket, this.eventID, this.eventName);
                this.published = true;
            }
        }
        
        this.signalChangeObject = function (aAction, aObjectID, aAttribute) {
            this.autoPublish();
            signalChangeObject(fSocket, this.eventID, aAction, aObjectID, aAttribute);
        };
        
        this.signalIntString = function (aCommand, aPayload) {
            this.autoPublish();
            SignalIntString(fSocket, this.eventID, aCommand, aPayload);
        };
        
        this.signalString = function (aPayload) {
            this.autoPublish();
            SignalString(fSocket, this.eventID, aPayload);
        };
        
        this.signalStream = function (aStreamName, aStream) {
            this.autoPublish();
            signalStream(fSocket, this.eventID, aStreamName, aStream);
        }
    }

    this.disconnect = function () {
        fSocket.end();
    };
    
    function addOrSetEvent(aEventName) {
        var eventID = fEventNames.indexOf(aEventName);
        if (eventID < 0) {
            eventID = fEventNames.push(aEventName) - 1;
            if (fEventEntries.length < eventID + 1) {
                fEventEntries.length = eventID + 1;
            }
            // store this
            fEventEntries[eventID] = new eventEntry(eventID, aEventName);
        }
        return eventID;
    }

    this.subscribe = function (aEventName, aUsePrefix) {
        if (aUsePrefix == undefined || aUsePrefix) {
            aEventName = fPrefix + "." + aEventName;
        }
        var eventID = addOrSetEvent(aEventName);
        var eventEntry = fEventEntries[eventID];
        signalSubscribe(fSocket, eventID, aEventName);
        eventEntry.subscribed = true;
        return eventEntry;
    };

    this.unSubscribe = function (aEventName, aUsePrefix) {
        if (aUsePrefix == undefined || aUsePrefix) {
            aEventName = fPrefix + "." + aEventName;
        }
        var eventID = fEventNames.indexOf(aEventName);
        if (eventID >= 0) {
            var eventEntry = fEventEntries[eventID];
            signalUnSubscribe(fSocket, eventID);
            eventEntry.subscribed = false;
            return eventEntry;
        }
        else 
            return null;
    };

    this.publish = function (aEventName, aUsePrefix) {
        if (aUsePrefix == undefined || aUsePrefix) {
            aEventName = fPrefix + "." + aEventName;
        }
        var eventID = addOrSetEvent(aEventName);
        var eventEntry = fEventEntries[eventID];
        signalPublish(fSocket, eventID, aEventName);
        eventEntry.published = true;
        return eventEntry;
    };

    this.unPublish = function (aEventName, aUsePrefix) {
        if (aUsePrefix == undefined || aUsePrefix) {
            aEventName = fPrefix + "." + aEventName;
        }
        var eventID = fEventNames.indexOf(aEventName);
        if (eventID >= 0) {
            var eventEntry = fEventEntries[eventID];
            signalUnPublish(fSocket, eventID);
            eventEntry.published = false;
            return eventEntry;
        }
        else
            return null;
    };
};

util.inherits(TIMBConnection, EventEmitter);

exports.TIMBConnection = TIMBConnection;

// exports for consts
exports.actionNew = actionNew;
exports.actionDelete = actionDelete;
exports.actionChange = actionChange;

exports.imbEventNameSeperator = imbEventNameSeperator;
exports.imbEventFilterPostFix = imbEventFilterPostFix;

exports.imbDefaultPrefix = imbDefaultPrefix;
exports.imbDefaultHostname = imbDefaultHostname;
exports.imbDefaultSocketPort = imbDefaultSocketPort;
exports.imbDefaultTLSPort = imbDefaultTLSPort;