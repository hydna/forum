

// Constants
var LOBBY_CHANNEL       = script.env.LOBBY_CHANNEL;
var ROOM_OFFSET         = script.env.ROOM_OFFSET;
var MAX_USERS_PER_ROOM  = script.env.MAX_USERS_PER_ROOM;


// Variables
var connid              = null;
var message             = null;
var alias               = null;
var image               = null;


// Check if connection is authenticated
if (connection.get("authenticated") !== "yes") {
  exit(1, "NOT_AUTHENTICATED");
}

// Try to allocate a slot in the room
if (channel.incr("count", MAX_USERS_PER_ROOM) == false) {
  exit(1, "ROOM_IS_FULL");
}

// Convert the connection id to a hex-string
connid = connection.id.toString(16);

// Get users alias and image.
alias = connection.get("alias");
image = connection.get("image");

// Add connection to the `connections` collection
channel.push("connections", [connid, alias, image].join(","));

// Tell everyone currently in room that a new
// users has joined.
message = "notif:user-join " + [connid, alias, image].join(",");
channel.emit(message);

// Tell lobby that a rooms info has been changed
message = "notif:room-info " + [channel.id, channel.get("count")].join(",");
domain.getChannel(LOBBY_CHANNEL).emit(message);

// Allow the open of channel. Current connection is now granted to
// join the room.
connection.allow();

// All done!
exit(0);