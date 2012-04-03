
// Constants
var LOBBY_CHANNEL       = script.env.LOBBY_CHANNEL;
var ROOM_OFFSET         = script.env.ROOM_OFFSET;
var MAX_ROOMS           = script.env.MAX_ROOMS;
var MAX_USERS_PER_ROOM  = script.env.MAX_USERS_PER_ROOM;
var NAME_MIN_LENGTH     = 3;
var NAME_MAX_LENGTH     = 20;
var IMAGE_LENGTH        = 32;


// Variables
var token               = script.env.TOKEN;
var title               = null;
var message             = null;
var room                = null;

// Split room title that was sent in token
title = token.substr(token.indexOf(" ") + 1);


// Validate the name of the room
if (title.length < NAME_MIN_LENGTH || title.length > NAME_MAX_LENGTH ||
    /^[A-Za-z0-9\_\-\s]+$/.test(title) == false) {
  connection.reply("create_room:error BAD_TITLE");
  exit(1);
}


// Try to allocate a new room.
for (var id = ROOM_OFFSET; id < MAX_ROOMS + ROOM_OFFSET; id++) {

  // Get a reference to the channel 
  room = domain.getChannel(id);

  // Check if room channel is already active
  if (chan.get("active") != "yes") {

    // Set channel to active
    chan.set("active", "yes");

    // Send back the channel id of the new room.
    message = "create_room:ok " + id;
    connection.reply(message);

    // Also send a notification to all other connected user. They
    // should be aware that the new room exists
    message = "notif:room-created " + [id, title].join(",");
    channel.emit(message);

    // Exit the script, we are done with room creation
    exit(0);
  }

}

// No free room slots was available. Send back an error message
connection.reply("create_room:error MAX_ROOMS");