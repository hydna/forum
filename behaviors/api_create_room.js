
// Imports
var connection          = require("connection");
var resource            = require("resource");
var signal              = require("signal");


// Constants
var LOBBY_CHANNEL       = 1;
var CHANNEL_OFFSET      = 2;
var NAME_MIN_LENGTH     = 3;
var NAME_MAX_LENGTH     = 20;
var IMAGE_LENGTH        = 32;


// Variables
var connid              = connection.getID();
var rooms               = resource.load("forum:rooms");
var token               = script.env.TOKEN;
var title               = token.split(" ")[1];
var slotid              = null;
var message             = null;


// Validate the name of the room
if (title.length < NAME_MIN_LENGTH || title.length > NAME_MAX_LENGTH ||
    /^[A-Za-z0-9\_\-]+$/.test(title) == false) {
  signal.reply("create_room:error BAD_TITLE");
  exit(1);
}


// Try to allocate a new room. The slot-ID is returned
// on success. 
if ((slotid = rooms.alloc(title)) == null) {
  signal.reply("create_room:error MAX_ROOMS");
  exit(1);
}


// Send back the channel id of the new room.
message = "create_room:ok " + (CHANNEL_OFFSET + slotid);
signal.reply(message);


// Also send a notification to all other connected user. They
// should be aware that the new room exists
message = "notif:room-created " + [(CHANNEL_OFFSET + slotid), title].join(",");
signal.emitChannel(LOBBY_CHANNEL, message);