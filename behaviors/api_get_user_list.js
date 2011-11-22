
// Imports
var connection          = require("connection");
var resource            = require("resource");
var signal              = require("signal");


// Constants
var ROOM_OFFSET         = 2;


// Variables
var channel             = script.env.CHANNEL;
var roomid              = channel - ROOM_OFFSET;
var room                = resource.load("forum:room" + roomid);
var slotid              = slotid;
var all                 = null;
var result              = [];
var data                = null;


result = [];
all = room.findall();

for (var i = 0, l = all.length; i < l; i++) {
  slotid = all[i];
  data = room.find(slotid);
  result.push(data);
}


signal.reply("get_user_list:ok " + result.join(";"));