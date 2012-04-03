
var ROOM_OFFSET         = script.env.ROOM_OFFSET;
var MAX_ROOMS           = script.env.MAX_ROOMS;


// Variables
var room                = null;
var str                 = null;
var result              = null;


result = [];

for (var id = ROOM_OFFSET; id < MAX_ROOMS; id++) {
  room = domain.getChannel(id);
  if (room.get("active") == "yes") {
    str = [id, room.get("title"), room.get("count")].join(",");
    result.push(str);
  }
}

connection.reply("get_rooms:ok " + result.join(";"));