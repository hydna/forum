

// Constants
var LOBBY_CHANNEL       = script.env.LOBBY_CHANNEL;

// Variables
var connid              = null;
var message             = null;


// Convert connection to string
connid = connection.id.toString(16);

// Remove connection from channel colllection
channel.rem("connections", new RegExp("^" + connid));
channel.decr("count", 0);

// Check if current connection was the last user in the room
if (channel.get("count") == 0) {

  // Tell every user that room has been destroyed.
  message = "notif:room-destroyed " + channel.id;
  domain.getChannel(LOBBY_CHANNEL).emit(message);
  channel.reset();

} else {

  // Tell other users in room that current connection leaved.
  message = "notif:user-leave " + connid;
  channel.emit(message);

  // Tell lobby that room details have changed
  message = "notif:room-info " + [channel.id, channel.get("count")].join(",");
  domain.getChannel(LOBBY_CHANNEL).emit(message);

}