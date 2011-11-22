
// Imports
var connection          = require("connection");
var resource            = require("resource");
var signal              = require("signal");


// Constants
var LOBBY_CHANNEL       = 1;
var ROOM_OFFSET         = 2;


// Variables
var connid              = connection.getID().toString(16);
var channel             = script.env.CHANNEL;
var roomid              = channel - ROOM_OFFSET;
var room                = resource.load("forum:room" + roomid);
var slotid              = null;
var message             = null;
var rooms               = null;


// Find the slotid of connection
slotid = room.find(new RegExp("^" + connid));


// Free the slot
room.dealloc(slotid);


// Check if current connection was the last user in the room
if (room.count() == 0) {

  rooms = resource.load("forum:rooms");

  // Free the room id slot
  rooms.dealloc(roomid);

  // Tell every user that room has been destroyed.
  message = "notif:room-destroyed " + channel;
  signal.emitChannel(LOBBY_CHANNEL, message);

} else {

  // Tell other users in room that current connection leaved.
  message = "notif:user-leave " + connid;
  signal.emitChannel(channel, message);

  // Tell lobby that room details have changed
  message = "notif:room-info " + [channel, room.count()].join(",");
  signal.emitChannel(LOBBY_CHANNEL, message);
}

