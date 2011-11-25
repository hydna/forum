
// Imports
var connection          = require("connection");
var resource            = require("resource");
var signal              = require("signal");


// Constants
var LOBBY_CHANNEL       = 1;
var ROOM_OFFSET         = 2;
var ALIAS_MAX_LENGTH    = 20;
var IMAGE_LENGTH        = 32;


// Variables
var connid              = connection.getID().toString(16);
var channel             = script.env.CHANNEL;
var roomid              = channel - ROOM_OFFSET;
var room                = resource.load("forum:room" + roomid);
var token               = script.env.TOKEN.split(",");
var alias               = token[0];
var image               = token[1];
var slotid              = null;
var message             = null;


// Validate the 'alias' length and that user has typed an alias
// with letters and digits only.
if (alias.length > ALIAS_MAX_LENGTH || alias.length < 2 ||
    /^[A-Za-z0-9\_\-\s]+$/.test(alias) == false) {
  connection.deny("BAD_ALIAS_FORMAT");
}


// Validate that a valid md5-value was passed for image.
if (image.length != IMAGE_LENGTH) {
  connection.deny("BAD_IMAGE_FORMAT");
}


// The room is full if we can't allocate a slot.
if ((slotid = room.alloc([connid, alias, image].join(","))) == null) {
  connection.deny("ROOM_IS_FULL");
}


// Tell everyone currently in room that a new
// users has joined.
message = "notif:user-join " + [connid, alias, image].join(",");
signal.emitChannel(channel, message);


// Tell lobby that a rooms info has been changed
message = "notif:room-info " + [channel, room.count()].join(",");
signal.emitChannel(LOBBY_CHANNEL, message);


// Allow the open of channel. Current connection is now granted to
// join the room.
connection.allow();